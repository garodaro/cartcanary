export type Platform = "Shopify" | "WooCommerce" | "Squarespace" | "Wix" | "Other";

export type BusinessType =
  | "Apparel"
  | "Beauty"
  | "Food & Beverage"
  | "Home Goods"
  | "Digital Products"
  | "Other";

export type MainConcern =
  | "Lots of traffic, not enough purchases"
  | "Low add-to-cart rate"
  | "High cart abandonment"
  | "Product page feels weak"
  | "Unsure what to test"
  | "Unsure if analytics are set up correctly"
  | "Other";

export type AuditFormData = {
  storeName: string;
  storeUrl: string;
  platform: Platform;
  businessType: BusinessType;
  monthlySessions: string;
  monthlyOrders: string;
  averageOrderValue: string;
  mainConcern: MainConcern;
  email?: string;
};

export type AbTestFeasibility = "Low" | "Moderate" | "High";

export type CalculatedMetrics = {
  monthlySessions: number;
  monthlyOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  estimatedMonthlyRevenue: number;
  revenueWithTenPercentConversionLift: number;
  incrementalMonthlyRevenue: number;
  abTestFeasibility: AbTestFeasibility;
};

export type PageSignals = {
  url: string;
  pageTitle: string;
  metaDescription: string;
  headings: string[];
  ctaTexts: string[];
  bodyTextSample: string;
  internalLinks: string[];
  productLikeLinks: string[];
  collectionLikeLinks: string[];
  cartLikeLinks: string[];
  checkoutLikeLinks: string[];
  mentions: {
    shipping: boolean;
    returns: boolean;
    guarantees: boolean;
    reviews: boolean;
    testimonials: boolean;
    secureCheckout: boolean;
    paymentOptions: boolean;
    discounts: boolean;
    subscriptions: boolean;
    sizing: boolean;
    delivery: boolean;
    freeShipping: boolean;
  };
};

export type ScreenshotSet = {
  desktop?: string;
  mobile?: string;
  productPage?: string;
};

export type PageAnalysisResult = {
  normalizedUrl: string;
  auditMode: "Form + homepage" | "Form + homepage + product page" | "Form-only fallback";
  homepage?: PageSignals;
  productPage?: PageSignals;
  screenshots: ScreenshotSet;
  warnings: string[];
};

export type Scorecard = {
  name: string;
  score: number;
  explanation: string;
  evidence: string;
};

export type FrictionPoint = {
  title: string;
  severity: "Low" | "Medium" | "High";
  evidence: string;
  recommendation: string;
};

export type Recommendation = {
  item: string;
  type: "Fix" | "Test" | "Investigate";
  impact: "Low" | "Medium" | "High";
  effort: "Low" | "Medium" | "High";
  rationale: string;
};

export type ActionPlanWeek = {
  week: string;
  focus: string;
  tasks: string[];
};

export type AuditReport = {
  executiveSummary: string;
  auditMode: "Form + homepage" | "Form + homepage + product page" | "Form-only fallback";
  overallScore: number;
  scorecards: Scorecard[];
  keyMetrics: {
    conversionRate: string;
    monthlyRevenue: string;
    revenueLiftFromTenPercentConversionImprovement: string;
    abTestFeasibility: AbTestFeasibility;
  };
  frictionPoints: FrictionPoint[];
  recommendationTable: Recommendation[];
  abTestFeasibilityExplanation: string;
  actionPlan30Days: ActionPlanWeek[];
};

export type AuditApiResponse = {
  formData: AuditFormData;
  normalizedUrl: string;
  metrics: CalculatedMetrics;
  analysis: PageAnalysisResult;
  report: AuditReport;
  fallbackReason?: string;
};

export const initialAuditFormData: AuditFormData = {
  storeName: "",
  storeUrl: "",
  platform: "Shopify",
  businessType: "Apparel",
  monthlySessions: "",
  monthlyOrders: "",
  averageOrderValue: "",
  mainConcern: "Lots of traffic, not enough purchases",
  email: "",
};

export const platforms: Platform[] = [
  "Shopify",
  "WooCommerce",
  "Squarespace",
  "Wix",
  "Other",
];

export const businessTypes: BusinessType[] = [
  "Apparel",
  "Beauty",
  "Food & Beverage",
  "Home Goods",
  "Digital Products",
  "Other",
];

export const mainConcerns: MainConcern[] = [
  "Lots of traffic, not enough purchases",
  "Low add-to-cart rate",
  "High cart abandonment",
  "Product page feels weak",
  "Unsure what to test",
  "Unsure if analytics are set up correctly",
  "Other",
];

export function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function calculateMetrics(formData: AuditFormData): CalculatedMetrics {
  const monthlySessions = parsePositiveNumber(formData.monthlySessions);
  const monthlyOrders = parsePositiveNumber(formData.monthlyOrders);
  const averageOrderValue = parsePositiveNumber(formData.averageOrderValue);
  const conversionRate = monthlySessions > 0 ? monthlyOrders / monthlySessions : 0;
  const estimatedMonthlyRevenue = monthlyOrders * averageOrderValue;
  const revenueWithTenPercentConversionLift = estimatedMonthlyRevenue * 1.1;

  return {
    monthlySessions,
    monthlyOrders,
    averageOrderValue,
    conversionRate,
    estimatedMonthlyRevenue,
    revenueWithTenPercentConversionLift,
    incrementalMonthlyRevenue:
      revenueWithTenPercentConversionLift - estimatedMonthlyRevenue,
    abTestFeasibility: getAbTestFeasibility(monthlySessions),
  };
}

export function getAbTestFeasibility(monthlySessions: number): AbTestFeasibility {
  if (monthlySessions < 5000) {
    return "Low";
  }

  if (monthlySessions <= 25000) {
    return "Moderate";
  }

  return "High";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
