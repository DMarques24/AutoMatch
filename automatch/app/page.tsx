"use client";

import { useState } from "react";
import VehicleForm from "@/components/VehicleForm";
import MatchResult from "@/components/MatchResult";
import type { VehiclePreferences, MatchResult as MatchResultType } from "@/types/vehicle";

export default function Home() {
  const [result, setResult] = useState<MatchResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(prefs: VehiclePreferences) {
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 py-16 px-4">
      <h1 className="text-4xl font-bold">AutoMatch</h1>
      <p className="text-zinc-500 text-sm">Tell us what you want and we&apos;ll find the best vehicle for you.</p>

      <VehicleForm onSubmit={handleSubmit} loading={loading} />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && <MatchResult result={result} />}
    </main>
  );
}
