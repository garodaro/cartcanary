import Image from "next/image";

const mascotPath = "/brand/cartcanary-favicon-head.png";
const heroMascotPath = "/brand/mascot-clipboard.png";

export function ConversionSnapshotCard() {
  return (
    <div className="relative rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/25">
      <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl" />
      <Image
        src={heroMascotPath}
        alt="CartCanary mascot holding a checklist"
        width={120}
        height={124}
        className="pointer-events-none absolute -top-12 right-24 z-10 hidden h-28 w-28 object-contain lg:block"
      />
      <div className="relative z-20 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 pr-24 lg:pr-32">
          <Image
            src={mascotPath}
            alt="CartCanary mascot"
            width={48}
            height={48}
            className="rounded-2xl border border-white/10 bg-white object-contain p-1"
          />
          <div>
            <p className="text-sm text-slate-300">Demo report</p>
            <h2 className="text-2xl font-black tracking-tight">Conversion Snapshot</h2>
          </div>
        </div>
        <span className="relative z-30 rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">
          Ready
        </span>
      </div>

      <div className="relative mt-6 grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl bg-white/10 p-5">
          <p className="text-sm font-semibold text-slate-300">Overall Conversion Readiness</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-6xl font-black text-emerald-400">72</span>
            <span className="pb-2 text-2xl font-bold text-slate-400">/100</span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-emerald-400" />
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Good foundation, key opportunities found.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {[
            ["Est. Monthly Revenue", "$12,450"],
            ["Est. Revenue Lift", "+$1,245"],
            ["Conversion Rate", "0.72%"],
            ["Monthly Sessions", "17,300"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-semibold text-slate-400">{label}</p>
              <p
                className={`mt-2 text-2xl font-black ${
                  value.startsWith("+") ? "text-emerald-400" : "text-white"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="mb-3 text-sm font-bold">Top Friction Areas</p>
          {[
            ["Shipping clarity", "Fix now", "48/100"],
            ["Product-page trust", "Fix now", "52/100"],
            ["CTA path", "Test later", "66/100"],
            ["Analytics gaps", "Investigate", "40/100"],
          ].map(([label, tag, score]) => (
            <div key={label} className="mb-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <span className="text-xs text-slate-300">{label}</span>
              <span className="rounded-full bg-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-200">
                {tag}
              </span>
              <span className="text-xs text-slate-300">{score}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="mb-4 text-sm font-bold">Fix / Test / Investigate</p>
          <div className="mx-auto h-24 w-24 rounded-full border-[14px] border-blue-500 border-l-yellow-400 border-t-red-400" />
          <div className="mt-4 grid gap-2 text-xs text-slate-300">
            <span>Fix now: 3</span>
            <span>Test later: 2</span>
            <span>Investigate: 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
