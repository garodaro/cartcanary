import { NextRequest, NextResponse } from "next/server";
import { analyzePublicStore, normalizePublicUrl } from "@/lib/analyzePublicStore";
import { generateAuditReport } from "@/lib/generateAuditReport";
import { generateFallbackReport } from "@/lib/generateFallbackReport";
import {
  AuditFormData,
  businessTypes,
  calculateMetrics,
  mainConcerns,
  platforms,
} from "@/lib/reportLogic";

export const runtime = "nodejs";

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
      scanFailure = friendlyScanFailure(error);
      analysis = {
        normalizedUrl,
        auditMode: "Form-only fallback" as const,
        screenshots: {},
        warnings: [scanFailure],
      };
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
