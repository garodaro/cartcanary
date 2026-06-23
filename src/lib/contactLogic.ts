export const expertHelpOptions = [
  "Review my CartCanary audit",
  "Prioritize fixes",
  "Plan an A/B test",
  "Validate analytics/tracking",
  "Build an experimentation roadmap",
  "Other",
] as const;

export type ExpertHelpOption = (typeof expertHelpOptions)[number];

export type ExpertContactPayload = {
  name: string;
  email: string;
  storeUrl: string;
  companyName: string;
  helpWith: ExpertHelpOption | "";
  message: string;
  mainConcern?: string;
  auditMode?: string;
  overallScore?: string;
};

export const expertContactEmail = "garethmwilson@gmail.com";
export const expertContactSubject = "CartCanary expert review request";

export function buildExpertContactEmailBody(payload: ExpertContactPayload) {
  const rows = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Company / Store name", payload.companyName],
    ["Store URL", payload.storeUrl],
    ["What they need help with", payload.helpWith],
    ["Message", payload.message],
    ["Main concern", payload.mainConcern],
    ["Audit mode", payload.auditMode],
    ["Overall score", payload.overallScore],
  ];

  return rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

export function buildExpertContactMailto(payload: ExpertContactPayload) {
  const params = new URLSearchParams({
    subject: expertContactSubject,
    body: buildExpertContactEmailBody(payload),
  });

  return `mailto:${expertContactEmail}?${params.toString()}`;
}
