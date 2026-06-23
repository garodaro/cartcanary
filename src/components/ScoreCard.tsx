import { Scorecard } from "@/lib/reportLogic";
import Image from "next/image";

type ScoreCardProps = {
  score: Scorecard;
};

const scorecardIcons: Record<string, string> = {
  "Overall Conversion Readiness": "/brand/icon-checklist.png",
  "Mobile UX": "/brand/icon-fast.png",
  "Trust & Credibility": "/brand/icon-trust.png",
  "Offer Clarity": "/brand/icon-uncover-friction.png",
  "CTA / Purchase Path": "/brand/icon-prioritize-action.png",
  "Analytics Readiness": "/brand/icon-analytics.png",
};

export function ScoreCard({ score }: ScoreCardProps) {
  const tone =
    score.score >= 75
      ? "bg-emerald-500"
      : score.score >= 62
        ? "bg-blue-500"
        : "bg-amber-500";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {scorecardIcons[score.name] && (
            <Image
              src={scorecardIcons[score.name]}
              alt={`${score.name} icon`}
              width={34}
              height={34}
              className="h-8 w-8 rounded-lg object-contain"
            />
          )}
          <h3 className="font-bold text-slate-950">{score.name}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
          {score.score}
        </span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${score.score}%` }} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{score.explanation}</p>
      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        {score.evidence}
      </p>
    </article>
  );
}
