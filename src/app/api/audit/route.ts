import { NextRequest, NextResponse } from "next/server";
import {
  analyzePublicStore,
  analyzePublicStoreTextOnly,
  normalizePublicUrl,
} from "@/lib/analyzePublicStore";
import { generateAuditReport } from "@/lib/generateAuditReport";
import { generateFallbackReport } from "@/lib/generateFallbackReport";
import {
  AuditFormData,
  businessTypes,
  calculateMetrics,
  CalculatedMetrics,
  mainConcerns,
  platforms,
} from "@/lib/reportLogic";
import { expertContactEmail } from "@/lib/contactLogic";

export const runtime = "nodejs";
export const maxDuration = 60;

const AUDIT_TIMEOUT_MS = 30000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AuditFormData>;
    const formData = validateFormData(body);
    const normalizedUrl = normalizePublicUrl(formData.storeUrl);
    const metrics = calculateMetrics(formData);

    let analysis;
    let scanFailure: string | undefined;

    try {
      analysis = await withTimeout(
        analyzePublicStore(normalizedUrl),
        AUDIT_TIMEOUT_MS,
        "Public page scan timed out. CartCanary continued with a form-only fallback report.",
      );
    } catch (error) {
      console.warn("CartCanary browser scan failed", sanitizeErrorForLogs(error));

      try {
        analysis = await withTimeout(
          analyzePublicStoreTextOnly(normalizedUrl, error),
          AUDIT_TIMEOUT_MS,
          "Public page text scan timed out.",
        );
      } catch (textScanError) {
        console.warn("CartCanary text scan failed", sanitizeErrorForLogs(textScanError));
        scanFailure = friendlyScanFailure(textScanError);
        analysis = {
          normalizedUrl,
          auditMode: "Form-only fallback" as const,
          screenshots: {},
          warnings: [scanFailure],
        };
      }
    }

    const generated = scanFailure
      ? {
          report: generateFallbackReport({
            formData,
            metrics,
            analysis,
            reason: scanFailure,
          }),
          fallbackReason: scanFailure,
        }
      : await generateAuditReport({ formData, metrics, analysis });

    if (formData.email) {
      try {
        await sendAuditLeadNotification({
          formData,
          metrics,
          normalizedUrl,
          auditMode: analysis.auditMode,
          overallScore: generated.report.overallScore,
        });
      } catch (leadEmailError) {
        console.warn("CartCanary audit lead email failed", sanitizeErrorForLogs(leadEmailError));
      }
    }

    return NextResponse.json({
      formData,
      normalizedUrl,
      metrics,
      analysis,
      report: generated.report,
      fallbackReason: generated.fallbackReason,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CartCanary could not start this audit. Please check the form and try again.",
      },
      { status: 400 },
    );
  }
}

async function sendAuditLeadNotification({
  formData,
  metrics,
  normalizedUrl,
  auditMode,
  overallScore,
}: {
  formData: AuditFormData;
  metrics: CalculatedMetrics;
  normalizedUrl: string;
  auditMode: string;
  overallScore: number;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info("CartCanary audit lead email skipped", { reason: "resend-not-configured" });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "CartCanary <onboarding@resend.dev>",
      to: [process.env.RESEND_TO_EMAIL ?? expertContactEmail],
      reply_to: formData.email,
      subject: `New CartCanary audit lead: ${formData.storeName}`,
      text: buildAuditLeadEmailBody({
        formData,
        metrics,
        normalizedUrl,
        auditMode,
        overallScore,
      }),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.warn("CartCanary audit lead email failed", {
      status: response.status,
      body: sanitizeProviderMessage(responseText),
    });
  }
}

function buildAuditLeadEmailBody({
  formData,
  metrics,
  normalizedUrl,
  auditMode,
  overallScore,
}: {
  formData: AuditFormData;
  metrics: CalculatedMetrics;
  normalizedUrl: string;
  auditMode: string;
  overallScore: number;
}) {
  return [
    "A visitor submitted a CartCanary audit and requested future follow-up.",
    "",
    `Email: ${formData.email}`,
    `Store name: ${formData.storeName}`,
    `Store URL: ${normalizedUrl}`,
    `Platform: ${formData.platform}`,
    `Business type: ${formData.businessType}`,
    `Main concern: ${formData.mainConcern}`,
    "",
    `Monthly sessions: ${metrics.monthlySessions}`,
    `Monthly orders: ${metrics.monthlyOrders}`,
    `Average order value: ${metrics.averageOrderValue}`,
    `Calculated conversion rate: ${(metrics.conversionRate * 100).toFixed(2)}%`,
    `Estimated monthly revenue: $${metrics.estimatedMonthlyRevenue.toFixed(0)}`,
    `Estimated 10% conversion lift value: $${metrics.incrementalMonthlyRevenue.toFixed(0)}`,
    `A/B test feasibility: ${metrics.abTestFeasibility}`,
    "",
    `Audit mode: ${auditMode}`,
    `Overall score: ${overallScore}/100`,
  ].join("\n");
}

function sanitizeProviderMessage(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/token[^",\s]*/gi, "token[redacted]")
    .slice(0, 600);
}

function sanitizeErrorForLogs(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unknown error";
  }

  return {
    name: error.name,
    message: error.message.split("\n")[0].slice(0, 500),
  };
}

function friendlyScanFailure(error: unknown) {
  const detail = error instanceof Error ? error.message : "";

  if (/timeout/i.test(detail)) {
    return "The public page scan timed out, so CartCanary continued with a form-only fallback report.";
  }

  if (/ERR_NAME_NOT_RESOLVED|ENOTFOUND/i.test(detail)) {
    return "CartCanary could not resolve that URL, so it continued with a form-only fallback report.";
  }

  if (/ERR_CONNECTION_REFUSED|ERR_UNSAFE_PORT|ERR_CERT/i.test(detail)) {
    return "CartCanary could not safely open that public URL, so it continued with a form-only fallback report.";
  }

  return "The public page scan could not be completed, so CartCanary continued with a form-only fallback report.";
}

function validateFormData(body: Partial<AuditFormData>): AuditFormData {
  const storeName = requireString(body.storeName, "Store name is required.");
  const storeUrl = requireString(body.storeUrl, "Store URL is required.");
  const platform = body.platform;
  const businessType = body.businessType;
  const mainConcern = body.mainConcern;

  if (!platform || !platforms.includes(platform)) {
    throw new Error("Please choose a valid platform.");
  }

  if (!businessType || !businessTypes.includes(businessType)) {
    throw new Error("Please choose a valid business type.");
  }

  if (!mainConcern || !mainConcerns.includes(mainConcern)) {
    throw new Error("Please choose a valid main concern.");
  }

  for (const [label, value] of [
    ["Monthly sessions", body.monthlySessions],
    ["Monthly orders", body.monthlyOrders],
    ["Average order value", body.averageOrderValue],
  ]) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`${label} must be a valid positive number.`);
    }
  }

  return {
    storeName,
    storeUrl,
    platform,
    businessType,
    monthlySessions: String(body.monthlySessions ?? ""),
    monthlyOrders: String(body.monthlyOrders ?? ""),
    averageOrderValue: String(body.averageOrderValue ?? ""),
    mainConcern,
    email: body.email?.trim() ?? "",
  };
}

function requireString(value: unknown, message: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
