import { CartCanaryLoader } from "@/components/CartCanaryLoader";
import { ProgressSteps } from "@/components/ProgressSteps";

export function LoadingState({ activeIndex }: { activeIndex: number }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-blue-950/5">
        <CartCanaryLoader />
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Building your CartCanary report
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          We&apos;re scanning public store signals and turning them into a practical
          fix / test / investigate plan.
        </p>
        <div className="mx-auto mt-8 max-w-md text-left">
          <ProgressSteps activeIndex={activeIndex} />
        </div>
      </div>
    </section>
  );
}
