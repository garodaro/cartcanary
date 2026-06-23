const steps = [
  "Reviewing store details",
  "Scanning public homepage",
  "Capturing screenshots",
  "Checking conversion signals",
  "Generating action plan",
];

export function ProgressSteps({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
              index <= activeIndex
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {index + 1}
          </span>
          <span className={index <= activeIndex ? "font-bold text-slate-900" : "text-slate-500"}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
