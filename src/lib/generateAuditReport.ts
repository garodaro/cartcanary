import OpenAI from "openai";
import { generateFallbackReport } from "@/lib/generateFallbackReport";
import {
  AuditFormData,
  AuditReport,
  CalculatedMetrics,
  PageAnalysisResult,
} from "@/lib/reportLogic";

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

const reportJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "executiveSummary",
    "auditMode",
    "overallScore",
    "scorecards",
    "keyMetrics",
    "frictionPoints",
    "recommendationTable",
    "abTestFeasibilityExplanation",
    "actionPlan30Days",
  ],
  properties: {
    executiveSummary: { type: "string" },
    auditMode: {
      type: "string",
      enum: ["Form + homepage", "Form + homepage + product page", "Form-only fallback"],
    },
    overallScore: { type: "number" },
    scorecards: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score", "explanation", "evidence"],
        properties: {
          name: { type: "string" },
          score: { type: "number" },
          explanation: { type: "string" },
          evidence: { type: "string" },
        },
      },
    },
    keyMetrics: {
      type: "object",
      additionalProperties: false,
      required: [
        "conversionRate",
        "monthlyRevenue",
        "revenueLiftFromTenPercentConversionImprovement",
        "abTestFeasibility",
      ],
      properties: {
        conversionRate: { type: "string" },
        monthlyRevenue: { type: "string" },
        revenueLiftFromTenPercentConversionImprovement: { type: "string" },
        abTestFeasibility: { type: "string", enum: ["Low", "Moderate", "High"] },
      },
    },
    frictionPoints: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "severity", "evidence", "recommendation"],
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["Low", "Medium", "High"] },
          evidence: { type: "string" },
          recommendation: { type: "string" },
        },
      },
    },
    recommendationTable: {
      type: "array",
      minItems: 5,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "type", "impact", "effort", "rationale"],
        properties: {
          item: { type: "string" },
          type: { type: "string", enum: ["Fix", "Test", "Investigate"] },
          impact: { type: "string", enum: ["Low", "Medium", "High"] },
          effort: { type: "string", enum: ["Low", "Medium", "High"] },
          rationale: { type: "string" },
        },
      },
    },
    abTestFeasibilityExplanation: { type: "string" },
    actionPlan30Days: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["week", "focus", "tasks"],
        properties: {
          week: { type: "string" },
          focus: { type: "string" },
          tasks: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        },
      },
    },
  },
};

export async function generateAuditReport({
  formData,
  metrics,
  analysis,
}: {
  formData: AuditFormData;
  metrics: CalculatedMetrics;
  analysis: PageAnalysisResult;
}): Promise<{ report: AuditReport; fallbackReason?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      report: generateFallbackReport({
        formData,
        metrics,
        analysis,
        reason: "OPENAI_API_KEY is not set, so CartCanary used its rule-based fallback.",
      }),
      fallbackReason: "OPENAI_API_KEY is not set. Used rule-based fallback report.",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
    const inputContent: Record<string, unknown>[] = [
      {
        type: "input_text",
        text: buildPrompt({ formData, metrics, analysis }),
      },
    ];

    // Screenshots are included as low-detail evidence when available. For a
    // production app, use object storage URLs instead of sending base64 data.
    for (const [label, imageUrl] of Object.entries(analysis.screenshots)) {
      if (imageUrl) {
        inputContent.push({
          type: "input_text",
          text: `Screenshot evidence: ${label}`,
        });
        inputContent.push({
          type: "input_image",
          image_url: imageUrl,
          detail: "low",
        });
      }
    }

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "user",
          content: inputContent,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cartcanary_audit_report",
          schema: reportJsonSchema,
          strict: true,
        },
      },
    } as never);

    const outputText = (response as { output_text?: string }).output_text;
    if (!outputText) {
      throw new Error("OpenAI returned an empty report.");
    }

    return { report: JSON.parse(outputText) as AuditReport };
  } catch (error) {
    const fallbackReason =
      error instanceof Error
        ? `OpenAI report generation failed: ${error.message}`
        : "OpenAI report generation failed.";

    return {
      report: generateFallbackReport({
        formData,
        metrics,
        analysis,
        reason: fallbackReason,
      }),
      fallbackReason,
    };
  }
}

function buildPrompt({
  formData,
  metrics,
  analysis,
}: {
  formData: AuditFormData;
  metrics: CalculatedMetrics;
  analysis: PageAnalysisResult;
}) {
  const safeAnalysis = {
    auditMode: analysis.auditMode,
    normalizedUrl: analysis.normalizedUrl,
    homepage: analysis.homepage,
    productPage: analysis.productPage,
    warnings: analysis.warnings,
    screenshotsAvailable: Object.fromEntries(
      Object.entries(analysis.screenshots).map(([key, value]) => [key, Boolean(value)]),
    ),
  };

  return `
You are CartCanary, an AI-assisted ecommerce optimization tool for ecommerce stores.
Generate a practical, specific, client-ready conversion-readiness report.

Rules:
- Use only the submitted form data, calculated metrics, screenshots, and extracted public page signals.
- Do not invent observations.
- Do not claim access to Shopify admin, GA4, checkout analytics, private data, or real sales data beyond the submitted numbers.
- Phrase findings as likely friction points or opportunities based on the public page scan.
- If a signal was not detected, say "not detected in the sampled public page content."
- If traffic is low, recommend fixing obvious issues and monitoring before/after instead of running small A/B tests.
- If traffic is 5,000-25,000 sessions, recommend only high-impact tests with simple success metrics.
- If traffic is above 25,000 sessions, recommend more structured A/B testing.
- If cart abandonment is the concern, emphasize shipping clarity, returns, checkout reassurance, trust signals, and payment clarity.
- If low add-to-cart rate or weak product page is the concern, emphasize product-page clarity, CTA visibility, proof, offer clarity, details, and mobile layout.
- If analytics setup is the concern, emphasize GA4/platform event tracking, add-to-cart, checkout started, purchase, mobile vs desktop, and source quality.
- Classify each recommendation as Fix, Test, or Investigate.
- Use concise plain English for ecommerce teams.

Submitted form data:
${JSON.stringify(formData, null, 2)}

Calculated metrics:
${JSON.stringify(metrics, null, 2)}

Public page analysis:
${JSON.stringify(safeAnalysis, null, 2)}
`;
}
