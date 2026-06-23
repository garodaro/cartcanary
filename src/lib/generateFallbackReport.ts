import {
  AuditFormData,
  AuditReport,
  CalculatedMetrics,
  PageAnalysisResult,
  formatCurrency,
  formatPercent,
} from "@/lib/reportLogic";

function clampScore(score: number) {
  return Math.max(42, Math.min(94, Math.round(score)));
}

function evidenceFromScan(analysis?: PageAnalysisResult) {
  if (!analysis?.homepage) {
    return "Public page content was not available, so this fallback is based on submitted store details.";
  }

  const detected = Object.entries(analysis.homepage.mentions)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`));

  return detected.length
    ? `Detected in sampled public page text: ${detected.slice(0, 5).join(", ")}.`
    : "Common trust and offer signals were not detected in the sampled public page content.";
}

function concernFocus(formData: AuditFormData) {
  if (formData.mainConcern === "High cart abandonment") {
    return {
      summary:
        "Prioritize checkout reassurance, shipping clarity, return visibility, and payment trust before testing more nuanced changes.",
      points: [
        "Shipping and delivery details may need stronger placement before cart entry.",
        "Return policy reassurance may need to appear closer to purchase decisions.",
        "Payment and secure-checkout messaging should be easy to find near the cart path.",
      ],
      recommendations: [
        "Show shipping timing, cost expectations, and return policy near product and cart CTAs.",
        "Add concise checkout reassurance near cart actions, including secure payment and support cues.",
      ],
    };
  }

  if (
    formData.mainConcern === "Low add-to-cart rate" ||
    formData.mainConcern === "Product page feels weak"
  ) {
    return {
      summary:
        "Prioritize product-page clarity, CTA visibility, social proof, offer details, and mobile layout before deeper experimentation.",
      points: [
        "Product benefits may need sharper above-the-fold messaging.",
        "Primary CTA visibility may need improvement on mobile.",
        "Reviews, sizing, specs, ingredients, or product detail quality may need stronger placement.",
      ],
      recommendations: [
        "Strengthen product-page decision content around benefits, proof, details, and CTA visibility.",
        "Clarify the offer with shipping thresholds, bundles, guarantees, or urgency only where truthful.",
      ],
    };
  }

  if (formData.mainConcern === "Unsure if analytics are set up correctly") {
    return {
      summary:
        "Prioritize measurement confidence before making major optimization decisions or judging channel performance.",
      points: [
        "Add-to-cart, checkout-started, and purchase events need validation before test reads are trusted.",
        "Mobile versus desktop conversion should be reviewed separately.",
        "Traffic source quality may be masking where friction begins.",
      ],
      recommendations: [
        "Validate GA4 or platform ecommerce events for view item, add to cart, checkout started, and purchase.",
        "Segment conversion by device and source before choosing the next experiment.",
      ],
    };
  }

  return {
    summary:
      "Prioritize obvious conversion friction, public-page trust signals, and clean measurement before running complex experiments.",
    points: [
      "The homepage or product-page value proposition may need clearer first-screen messaging.",
      "Trust, shipping, returns, and CTA cues should be easy to find before checkout.",
      "Analytics tracking should be checked before relying on experiment results.",
    ],
    recommendations: [
      "Clarify the first-screen offer and make the next action unmistakable.",
      "Review key funnel tracking and compare mobile, desktop, and traffic-source performance.",
    ],
  };
}

export function generateFallbackReport({
  formData,
  metrics,
  analysis,
  reason,
}: {
  formData: AuditFormData;
  metrics: CalculatedMetrics;
  analysis?: PageAnalysisResult;
  reason?: string;
}): AuditReport {
  const focus = concernFocus(formData);
  const scanEvidence = evidenceFromScan(analysis);
  const baseScore =
    metrics.conversionRate >= 0.03 ? 78 : metrics.conversionRate >= 0.015 ? 68 : 56;
  const trafficAdjustment = metrics.abTestFeasibility === "Low" ? -8 : 0;

  return {
    executiveSummary: `${formData.storeName || "This store"} converts at ${formatPercent(
      metrics.conversionRate,
    )} based on the submitted monthly sessions and orders. ${focus.summary} ${
      reason ? `Fallback note: ${reason}` : ""
    }`,
    auditMode: analysis?.auditMode ?? "Form-only fallback",
    overallScore: clampScore(baseScore + trafficAdjustment),
    scorecards: [
      {
        name: "Overall Conversion Readiness",
        score: clampScore(baseScore + trafficAdjustment),
        explanation:
          "Combines submitted conversion performance, traffic level, and public-page readiness signals.",
        evidence: scanEvidence,
      },
      {
        name: "Mobile UX",
        score: clampScore(68),
        explanation:
          "Mobile purchase paths should keep CTAs, trust cues, and product details visible without extra effort.",
        evidence:
          analysis?.screenshots.mobile
            ? "Mobile screenshot was captured from the public homepage."
            : "Mobile screenshot was not available in this fallback.",
      },
      {
        name: "Trust & Credibility",
        score: clampScore(formData.mainConcern === "High cart abandonment" ? 58 : 70),
        explanation:
          "First-time shoppers need reassurance around shipping, returns, payment safety, reviews, and support.",
        evidence: scanEvidence,
      },
      {
        name: "Offer Clarity",
        score: clampScore(formData.mainConcern === "Product page feels weak" ? 58 : 68),
        explanation:
          "The offer should explain what the customer gets, why it matters, and what to do next.",
        evidence: scanEvidence,
      },
      {
        name: "CTA / Purchase Path",
        score: clampScore(formData.mainConcern === "Low add-to-cart rate" ? 58 : 69),
        explanation:
          "Purchase CTAs should be prominent, specific, and supported by enough decision-making context.",
        evidence: scanEvidence,
      },
      {
        name: "Analytics Readiness",
        score: clampScore(
          formData.mainConcern === "Unsure if analytics are set up correctly" ? 52 : 66,
        ),
        explanation:
          "Event tracking should support add-to-cart, checkout-started, purchase, device, and source analysis.",
        evidence:
          "CartCanary did not access private analytics or store admin data in this prototype.",
      },
    ],
    keyMetrics: {
      conversionRate: formatPercent(metrics.conversionRate),
      monthlyRevenue: formatCurrency(metrics.estimatedMonthlyRevenue),
      revenueLiftFromTenPercentConversionImprovement: formatCurrency(
        metrics.incrementalMonthlyRevenue,
      ),
      abTestFeasibility: metrics.abTestFeasibility,
    },
    frictionPoints: [
      {
        title: focus.points[0],
        severity: "High",
        evidence: scanEvidence,
        recommendation: focus.recommendations[0],
      },
      {
        title: focus.points[1],
        severity: "Medium",
        evidence: scanEvidence,
        recommendation: focus.recommendations[1],
      },
      {
        title: focus.points[2],
        severity: "Medium",
        evidence:
          "This is a likely opportunity based on the selected main concern and submitted traffic level.",
        recommendation:
          "Review the relevant page on mobile and desktop, then make the smallest obvious improvement first.",
      },
      {
        title: "Funnel events need validation before major decisions",
        severity:
          formData.mainConcern === "Unsure if analytics are set up correctly" ? "High" : "Medium",
        evidence:
          "This prototype does not access GA4, Shopify admin, or private analytics data.",
        recommendation:
          "Confirm view item, add to cart, checkout started, purchase, device split, and source quality tracking.",
      },
      {
        title: "Testing approach should match traffic level",
        severity: metrics.abTestFeasibility === "Low" ? "High" : "Medium",
        evidence: `${metrics.monthlySessions.toLocaleString()} monthly sessions puts A/B test feasibility at ${metrics.abTestFeasibility}.`,
        recommendation:
          metrics.abTestFeasibility === "Low"
            ? "Ship obvious fixes and monitor before/after trends instead of running small A/B tests."
            : "Use focused tests with simple success metrics and enough time to collect a clean read.",
      },
    ],
    recommendationTable: [
      {
        item: focus.recommendations[0],
        type: "Fix",
        impact: "High",
        effort: "Medium",
        rationale: "This is a high-confidence improvement connected to the stated concern.",
      },
      {
        item: focus.recommendations[1],
        type: metrics.abTestFeasibility === "High" ? "Test" : "Fix",
        impact: "Medium",
        effort: "Medium",
        rationale:
          metrics.abTestFeasibility === "High"
            ? "Traffic appears sufficient for a focused test once tracking is clean."
            : "At this traffic level, a clear improvement plus before/after monitoring is more practical.",
      },
      {
        item: "Validate analytics events and funnel segmentation",
        type: "Investigate",
        impact: "High",
        effort: "Medium",
        rationale:
          "Measurement confidence prevents the team from optimizing the wrong page, device, or source.",
      },
      {
        item: "Review mobile homepage and product-page screenshots",
        type: "Investigate",
        impact: "Medium",
        effort: "Low",
        rationale:
          "Public screenshots can reveal CTA visibility, trust placement, and content hierarchy issues.",
      },
      {
        item: "Create one 30-day optimization scoreboard",
        type: "Fix",
        impact: "Medium",
        effort: "Low",
        rationale:
          "Track sessions, orders, conversion rate, AOV, add-to-cart, checkout started, and purchase weekly.",
      },
    ],
    abTestFeasibilityExplanation:
      metrics.abTestFeasibility === "Low"
        ? "With fewer than 5,000 monthly sessions, small A/B tests are unlikely to produce reliable reads. Fix obvious public-page issues and monitor before/after trends."
        : metrics.abTestFeasibility === "Moderate"
          ? "With 5,000 to 25,000 monthly sessions, use only high-impact tests with simple success metrics and avoid splitting traffic across too many experiments."
          : "With more than 25,000 monthly sessions, structured A/B testing is more realistic if analytics events are validated first.",
    actionPlan30Days: [
      {
        week: "Week 1",
        focus: "Baseline and measurement confidence",
        tasks: [
          "Confirm sessions, orders, conversion rate, AOV, add-to-cart, checkout started, and purchase tracking.",
          "Review mobile versus desktop conversion and traffic-source quality.",
        ],
      },
      {
        week: "Week 2",
        focus: "Fix obvious public-page friction",
        tasks: [
          "Improve the highest-confidence CTA, trust, shipping, returns, or product-detail issue.",
          "Check the updated experience on mobile and desktop before publishing.",
        ],
      },
      {
        week: "Week 3",
        focus: "Monitor impact",
        tasks: [
          "Compare before/after trends for conversion rate, add-to-cart rate, checkout starts, and orders.",
          "Collect customer-support or chat clues that explain remaining hesitation.",
        ],
      },
      {
        week: "Week 4",
        focus:
          metrics.abTestFeasibility === "Low"
            ? "Prepare for future testing"
            : "Run one focused experiment",
        tasks: [
          metrics.abTestFeasibility === "Low"
            ? "Document one future test idea once traffic grows."
            : "Launch one focused test with a clear success metric and minimum run window.",
          "Prioritize the next fix, test, or investigation based on the cleanest evidence.",
        ],
      },
    ],
  };
}
