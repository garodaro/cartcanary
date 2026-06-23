"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ExpertContactPayload,
  buildExpertContactMailto,
  expertHelpOptions,
} from "@/lib/contactLogic";

type ExpertContactFormProps = {
  title?: string;
  description?: string;
  defaults?: Partial<ExpertContactPayload>;
  compact?: boolean;
};

const emptyForm: ExpertContactPayload = {
  name: "",
  email: "",
  storeUrl: "",
  companyName: "",
  helpWith: "",
  message: "",
  mainConcern: "",
  auditMode: "",
  overallScore: "",
};

export function ExpertContactForm({
  title = "Contact an expert",
  description = "Tell us what you need help with and we will point you toward the next best decision.",
  defaults,
  compact = false,
}: ExpertContactFormProps) {
  const initialData = useMemo(() => ({ ...emptyForm, ...defaults }), [defaults]);
  const [formData, setFormData] = useState<ExpertContactPayload>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fallbackMailto, setFallbackMailto] = useState("");

  function updateField<Key extends keyof ExpertContactPayload>(
    field: Key,
    value: ExpertContactPayload[Key],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFallbackMailto("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFallbackMailto(data.mailtoHref ?? buildExpertContactMailto(formData));
        throw new Error(data.error ?? "CartCanary could not send this request.");
      }

      if (data.status === "fallback") {
        setFallbackMailto(data.mailtoHref ?? buildExpertContactMailto(formData));
        setError(data.message);
        return;
      }

      setSuccess(
        data.message ??
          "Thanks — your request was received. Gareth or a CartCanary experimentation expert will follow up.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "CartCanary could not send this request. Please try again.",
      );
      setFallbackMailto((current) => current || buildExpertContactMailto(formData));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-8">
      <div className={compact ? "mb-5" : "mb-7"}>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
          Expert guidance
        </p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={inputClassName}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store URL" required>
            <input
              value={formData.storeUrl}
              onChange={(event) => updateField("storeUrl", event.target.value)}
              className={inputClassName}
              placeholder="https://example.com"
              required
            />
          </Field>
          <Field label="Company / Store name" required>
            <input
              value={formData.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
              className={inputClassName}
              required
            />
          </Field>
        </div>

        <Field label="What do you need help with?" required>
          <select
            value={formData.helpWith}
            onChange={(event) =>
              updateField("helpWith", event.target.value as ExpertContactPayload["helpWith"])
            }
            className={inputClassName}
            required
          >
            <option value="">Choose one</option>
            {expertHelpOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Message" required>
          <textarea
            value={formData.message}
            onChange={(event) => updateField("message", event.target.value)}
            className={`${inputClassName} min-h-32 resize-y`}
            placeholder="Share what decision you are trying to make."
            required
          />
        </Field>

        {(formData.mainConcern || formData.auditMode || formData.overallScore) && (
          <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950 sm:grid-cols-3">
            {formData.mainConcern && <ContextItem label="Main concern" value={formData.mainConcern} />}
            {formData.auditMode && <ContextItem label="Audit mode" value={formData.auditMode} />}
            {formData.overallScore && <ContextItem label="Overall score" value={formData.overallScore} />}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
            {error}
            {fallbackMailto && (
              <a
                href={fallbackMailto}
                className="mt-3 inline-flex rounded-xl bg-slate-950 px-4 py-2 font-black text-white transition hover:bg-slate-800"
              >
                Open email instead
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Sending request..." : "Contact an expert"}
        </button>
      </form>
    </div>
  );
}

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      {required && <span className="text-blue-600"> *</span>}
      {children}
    </label>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-black">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
