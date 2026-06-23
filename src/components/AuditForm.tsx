import { FormEvent, useState } from "react";
import {
  AuditFormData,
  businessTypes,
  mainConcerns,
  platforms,
} from "@/lib/reportLogic";

type AuditFormProps = {
  initialData: AuditFormData;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (formData: AuditFormData) => Promise<void> | void;
};

export function AuditForm({ initialData, isLoading, onBack, onSubmit }: AuditFormProps) {
  const [formData, setFormData] = useState(initialData);

  function updateField<Key extends keyof AuditFormData>(
    key: Key,
    value: AuditFormData[Key],
  ) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoading) {
      onSubmit(formData);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="mb-8 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Back to overview
      </button>

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Free audit intake
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Tell CartCanary about the store.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Use simple monthly numbers and a public store URL to generate a
          polished conversion-readiness report.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/5 sm:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Store name">
            <input
              required
              value={formData.storeName}
              onChange={(event) => updateField("storeName", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Acme Goods"
            />
          </Field>

          <Field label="Store URL">
            <input
              required
              value={formData.storeUrl}
              onChange={(event) => updateField("storeUrl", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="https://example.com"
            />
          </Field>

          <Field label="Platform">
            <select
              value={formData.platform}
              onChange={(event) =>
                updateField("platform", event.target.value as AuditFormData["platform"])
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {platforms.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </Field>

          <Field label="Business type">
            <select
              value={formData.businessType}
              onChange={(event) =>
                updateField(
                  "businessType",
                  event.target.value as AuditFormData["businessType"],
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {businessTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Monthly sessions">
            <input
              required
              min="1"
              type="number"
              value={formData.monthlySessions}
              onChange={(event) => updateField("monthlySessions", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="12000"
            />
          </Field>

          <Field label="Monthly orders">
            <input
              required
              min="0"
              type="number"
              value={formData.monthlyOrders}
              onChange={(event) => updateField("monthlyOrders", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="240"
            />
          </Field>

          <Field label="Average order value">
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={formData.averageOrderValue}
              onChange={(event) => updateField("averageOrderValue", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="68"
            />
          </Field>

          <Field label="Main concern">
            <select
              value={formData.mainConcern}
              onChange={(event) =>
                updateField(
                  "mainConcern",
                  event.target.value as AuditFormData["mainConcern"],
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {mainConcerns.map((concern) => (
                <option key={concern}>{concern}</option>
              ))}
            </select>
          </Field>

          <Field label="Email for future follow-up (optional)">
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </Field>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            CartCanary scans public pages only. No login, admin access, checkout
            forms, payments, or private analytics.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Running audit..." : "Generate report"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
