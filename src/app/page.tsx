"use client";

import { useState } from "react";
import { ActionPlan } from "@/components/ActionPlan";
import { AuditForm } from "@/components/AuditForm";
import { ErrorState } from "@/components/ErrorState";
import { LandingPage } from "@/components/LandingPage";
import { LoadingState } from "@/components/LoadingState";
import { RecommendationTable } from "@/components/RecommendationTable";
import { ReportPage } from "@/components/ReportPage";
import { ScoreCard } from "@/components/ScoreCard";
import {
  AuditApiResponse,
  AuditFormData,
  initialAuditFormData,
} from "@/lib/reportLogic";

export default function Home() {
  const [step, setStep] = useState<"landing" | "form" | "loading" | "report" | "error">(
    "landing",
  );
  const [audit, setAudit] = useState<AuditApiResponse | null>(null);
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);

  async function handleSubmit(formData: AuditFormData) {
    setError("");
    setProgressIndex(0);
    setStep("loading");
    window.scrollTo({ top: 0 });

    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      interval = setInterval(() => {
        setProgressIndex((current) => Math.min(current + 1, 4));
      }, 1600);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "CartCanary could not complete this audit.");
      }

      setAudit(data as AuditApiResponse);
      setProgressIndex(4);
      setStep("report");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "CartCanary could not complete this audit. Please try again.",
      );
      setStep("error");
    } finally {
      if (interval) {
        clearInterval(interval);
      }
    }
  }

  return (
    <main className="min-h-screen">
      {step === "landing" && <LandingPage onStart={() => setStep("form")} />}

      {step === "form" && (
        <AuditForm
          initialData={initialAuditFormData}
          isLoading={false}
          onBack={() => setStep("landing")}
          onSubmit={handleSubmit}
        />
      )}

      {step === "loading" && <LoadingState activeIndex={progressIndex} />}

      {step === "error" && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError("");
            setStep("form");
          }}
        />
      )}

      {step === "report" && audit && (
        <ReportPage
          audit={audit}
          onHome={() => {
            setAudit(null);
            setStep("landing");
          }}
          onRestart={() => {
            setAudit(null);
            setStep("form");
          }}
          ScoreCardComponent={ScoreCard}
          RecommendationTableComponent={RecommendationTable}
          ActionPlanComponent={ActionPlan}
        />
      )}
    </main>
  );
}
