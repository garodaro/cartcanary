import { ComponentType } from "react";
import { ActionPlan } from "@/components/ActionPlan";
import { ExpertContactForm } from "@/components/ExpertContactForm";
import { MetricCard } from "@/components/MetricCard";
import { RecommendationTable } from "@/components/RecommendationTable";
import { ScreenshotPreview } from "@/components/ScreenshotPreview";
import { ScoreCard } from "@/components/ScoreCard";
import Image from "next/image";
import {
  ActionPlanWeek,
  AuditApiResponse,
  Recommendation,
  Scorecard,
} from "@/lib/reportLogic";

type ReportPageProps = {
  audit: AuditApiResponse;
  onHome: () => void;
  onRestart: () => void;
  ScoreCardComponent?: ComponentType<{ score: Scorecard }>;
  RecommendationTableComponent?: ComponentType<{ recommendations: Recommendation[] }>;
  ActionPlanComponent?: ComponentType<{ items: ActionPlanWeek[] }>;
};

export function ReportPage({
  audit,
  onHome,
  onRestart,
  ScoreCardComponent = ScoreCard,
  RecommendationTableComponent = RecommendationTable,
  ActionPlanComponent = ActionPlan,
}: ReportPageProps) {
  const { report, analysis, formData } = audit;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
      <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onHome}
            aria-label="Back to CartCanary homepage"
            className="mt-1 rounded-2xl outline-none transition hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-100"
          >
            <Image
              src="/brand/cartcanary-icon.png"
              alt="CartCanary icon"
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-1 shadow-sm"
            />
          </button>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-600">
              CartCanary Conversion Readiness Report
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {formData.storeName}
            </h1>
            <p className="mt-2 break-words text-slate-600">{audit.normalizedUrl}</p>
          </div>
        </div>
        <button
          onClick={onRestart}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Run another audit
        </button>
      </nav>

      {audit.fallbackReason && (
        <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          {audit.fallbackReason}
        </div>
      )}

      <section className="mb-6 grid gap-5 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-6 shadow-xl shadow-blue-950/5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
            Expert review
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Want expert help prioritizing this?
          </h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-700">
            Get a human review from Gareth or another CartCanary experimentation expert. We can
            help you decide what to fix now, what to test, what to investigate, and what to ignore
            so you do not waste traffic on weak experiments.
          </p>
          <p className="mt-3 text-sm font-bold text-slate-700">
            Gareth Wilson is a product and experimentation leader with 10+ years of experience
            optimizing ecommerce, subscription, entertainment, and consumer digital products across
            Disney Experiences, Fender, global retail ecommerce, and high-traffic digital platforms.
          </p>
        </div>
        <a
          href="#expert-review-contact"
          className="rounded-xl bg-blue-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Request expert review
        </a>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-8">
          <div className="mb-5 flex flex-wrap gap-3">
            <Badge>{formData.platform}</Badge>
            <Badge>{formData.businessType}</Badge>
            <Badge>{report.auditMode}</Badge>
          </div>
          <h2 className="text-2xl font-black text-slate-950">Executive Summary</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{report.executiveSummary}</p>
        </section>

        <section className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15 sm:p-8">
          <p className="text-sm font-semibold text-slate-300">Overall score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-6xl font-black text-emerald-400">{report.overallScore}</span>
            <span className="pb-2 text-2xl font-bold text-slate-400">/100</span>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-sm font-semibold text-slate-300">Primary concern</p>
            <p className="mt-2 text-xl font-black">{formData.mainConcern}</p>
          </div>
        </section>
      </div>

      <ReportSection title="Screenshot Previews">
        <div className="grid gap-5 lg:grid-cols-3">
          <ScreenshotPreview title="Desktop homepage" src={analysis.screenshots.desktop} />
          <ScreenshotPreview title="Mobile homepage" src={analysis.screenshots.mobile} />
          <ScreenshotPreview title="Product page sample" src={analysis.screenshots.productPage} />
        </div>
      </ReportSection>

      <ReportSection title="Scorecards">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {report.scorecards.map((score) => (
            <ScoreCardComponent key={score.name} score={score} />
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Key Metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Conversion rate" value={report.keyMetrics.conversionRate} />
          <MetricCard label="Estimated monthly revenue" value={report.keyMetrics.monthlyRevenue} />
          <MetricCard
            label="Potential monthly upside"
            value={report.keyMetrics.revenueLiftFromTenPercentConversionImprovement}
          />
          <MetricCard
            label="A/B test feasibility"
            value={report.keyMetrics.abTestFeasibility}
          />
        </div>
      </ReportSection>

      <ReportSection title="Top 5 Conversion Friction Points">
        <div className="grid gap-4">
          {report.frictionPoints.map((point, index) => (
            <article
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-yellow-700">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-950">{point.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{point.evidence}</p>
                    <p className="mt-3 font-semibold leading-7 text-slate-800">
                      {point.recommendation}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-fit rounded-full px-3 py-1 text-sm font-black ${
                    point.severity === "High"
                      ? "bg-red-50 text-red-700"
                      : point.severity === "Medium"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {point.severity}
                </span>
              </div>
            </article>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Fix / Test / Investigate">
        <RecommendationTableComponent recommendations={report.recommendationTable} />
      </ReportSection>

      <ReportSection title="A/B Test Feasibility">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            {report.keyMetrics.abTestFeasibility}
          </div>
          <p className="max-w-4xl text-lg leading-8 text-slate-600">
            {report.abTestFeasibilityExplanation}
          </p>
        </div>
      </ReportSection>

      <ReportSection title="30-Day Action Plan">
        <ActionPlanComponent items={report.actionPlan30Days} />
      </ReportSection>

      <section id="expert-review-contact" className="mt-10 scroll-mt-8">
        <ExpertContactForm
          title="Request expert review"
          description="Share the decision you are trying to make. We will use your audit context to help you focus on the highest-value next step."
          defaults={{
            storeUrl: audit.normalizedUrl,
            companyName: formData.storeName,
            helpWith: "Review my CartCanary audit",
            message:
              "I would like help interpreting this CartCanary audit and deciding what to fix, test, or investigate next.",
            mainConcern: formData.mainConcern,
            auditMode: report.auditMode,
            overallScore: `${report.overallScore}/100`,
          }}
        />
      </section>

      <div className="my-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center shadow-lg shadow-yellow-950/5">
        <h2 className="text-2xl font-black text-slate-950">Ready to review another store?</h2>
        <button
          onClick={onRestart}
          className="mt-5 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Run another audit
        </button>
      </div>
    </section>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
      {children}
    </span>
  );
}
