import { ActionPlanWeek } from "@/lib/reportLogic";

type ActionPlanProps = {
  items: ActionPlanWeek[];
};

export function ActionPlan({ items }: ActionPlanProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => (
        <article
          key={item.week}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {index + 1}
          </span>
          <h3 className="text-lg font-black text-slate-950">
            {item.week}: {item.focus}
          </h3>
          <ul className="mt-4 grid gap-2">
            {item.tasks.map((task) => (
              <li key={task} className="leading-7 text-slate-700">
                {task}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
