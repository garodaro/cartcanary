import { Recommendation } from "@/lib/reportLogic";

type RecommendationTableProps = {
  recommendations: Recommendation[];
};

export function RecommendationTable({ recommendations }: RecommendationTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_7rem] gap-4 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600 md:grid-cols-[1fr_7rem_7rem_7rem_1.4fr]">
        <span>Opportunity</span>
        <span>Call</span>
        <span className="hidden md:block">Impact</span>
        <span className="hidden md:block">Effort</span>
        <span className="hidden md:block">Why it matters</span>
      </div>
      {recommendations.map((row) => (
        <div
          key={row.item}
          className="grid grid-cols-[1fr_7rem] gap-4 border-t border-slate-100 px-5 py-4 md:grid-cols-[1fr_7rem_7rem_7rem_1.4fr]"
        >
          <p className="font-semibold text-slate-950">{row.item}</p>
          <span
            className={`h-fit rounded-full px-3 py-1 text-center text-sm font-bold ${
              row.type === "Fix"
                ? "bg-emerald-50 text-emerald-700"
                : row.type === "Test"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {row.type}
          </span>
          <span className="hidden text-sm font-bold text-slate-600 md:block">{row.impact}</span>
          <span className="hidden text-sm font-bold text-slate-600 md:block">{row.effort}</span>
          <p className="col-span-2 text-sm leading-6 text-slate-600 md:col-span-1">
            {row.rationale}
          </p>
        </div>
      ))}
    </div>
  );
}
