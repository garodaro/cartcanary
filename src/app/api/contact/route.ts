import { NextResponse } from "next/server";
import {
  ExpertContactPayload,
  buildExpertContactEmailBody,
  buildExpertContactMailto,
  expertContactEmail,
  expertContactSubject,
  expertHelpOptions,
} from "@/lib/contactLogic";

type ContactResponse =
  | { status: "sent"; message: string }
  | { status: "fallback"; message: string; mailtoHref: string }
  | { error: string; mailtoHref?: string };

export async function POST(request: Request) {
  try {
    const payload = normalizePayload(await request.json());
    const validationError = validatePayload(payload);
    const mailtoHref = buildExpertContactMailto(payload);

    if (validationError) {
      return NextResponse.json<ContactResponse>(
        { error: validationError, mailtoHref },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json<ContactResponse>({
        status: "fallback",
        message: "Email sending is not configured yet. You can still send your request directly.",
        mailtoHref,
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "CartCanary <onboarding@resend.dev>",
        to: [process.env.RESEND_TO_EMAIL ?? expertContactEmail],
        reply_to: payload.email,
        subject: expertContactSubject,
        text: buildExpertContactEmailBody(payload),
      }),
    });

    if (!resendResponse.ok) {
      const responseText = await resendResponse.text();
      console.warn("CartCanary contact email failed", {
        status: resendResponse.status,
        body: sanitizeProviderMessage(responseText),
      });

      return NextResponse.json<ContactResponse>(
        {
          error: "CartCanary could not send this request right now. You can still send it by email.",
          mailtoHref,
        },
        { status: 502 },
      );
    }

    return NextResponse.json<ContactResponse>({
      status: "sent",
      message:
        "Thanks — your request was received. Gareth or a CartCanary experimentation expert will follow up.",
    });
  } catch {
    return NextResponse.json<ContactResponse>(
      { error: "CartCanary could not process this contact request. Please try again." },
      { status: 400 },
    );
  }
}

function sanitizeProviderMessage(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/token[^",\s]*/gi, "token[redacted]")
    .slice(0, 600);
}

function normalizePayload(value: unknown): ExpertContactPayload {
  const body = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    name: normalizeString(body.name),
    email: normalizeString(body.email),
    storeUrl: normalizeString(body.storeUrl),
    companyName: normalizeString(body.companyName),
    helpWith: normalizeString(body.helpWith) as ExpertContactPayload["helpWith"],
    message: normalizeString(body.message),
    mainConcern: normalizeString(body.mainConcern),
    auditMode: normalizeString(body.auditMode),
    overallScore: normalizeString(body.overallScore),
  };
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: ExpertContactPayload) {
  if (!payload.name) {
    return "Please enter your name.";
  }

  if (!payload.email || !payload.email.includes("@")) {
    return "Please enter a valid email address.";
  }

  if (!payload.storeUrl) {
    return "Please enter a store URL.";
  }

  if (!payload.companyName) {
    return "Please enter a company or store name.";
  }

  if (!expertHelpOptions.includes(payload.helpWith as (typeof expertHelpOptions)[number])) {
    return "Please choose what you need help with.";
  }

  if (!payload.message) {
    return "Please add a short message.";
  }

  return "";
}
