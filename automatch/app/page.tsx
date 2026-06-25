"use client";

import { useState } from "react";
import VehicleForm from "@/components/VehicleForm";
import ListingCard from "@/components/ListingCard";
import type { VehiclePreferences, Listing } from "@/types/vehicle";

type Phase = "idle" | "model" | "fetching" | "extracting" | "scoring" | "done" | "error";

const PHASE_LABELS: Record<Phase, string> = {
  idle:       "",
  model:      "A analisar as tuas preferências…",
  fetching:   "A pesquisar anúncios nos sites…",
  extracting: "A ler e extrair os anúncios…",
  scoring:    "A IA está a avaliar cada anúncio…",
  done:       "",
  error:      "",
};

interface SearchResult {
  recommendation: string;
  make: string;
  model: string;
  listings: Listing[];
  searchUrl: string;
  source: string;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(prefs: VehiclePreferences) {
    setPhase("model");
    setError(null);
    setResult(null);

    try {
      setPhase("fetching");

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      setPhase("extracting");

      if (!res.ok) throw new Error("Server error");
      const data: SearchResult = await res.json();

      setPhase("scoring");
      // small pause so user sees the scoring phase label
      await new Promise((r) => setTimeout(r, 600));

      setResult(data);
      setPhase("done");
    } catch {
      setError("Algo correu mal. Tenta novamente.");
      setPhase("error");
    }
  }

  const loading = ["model", "fetching", "extracting", "scoring"].includes(phase);
  const bestListing = result?.listings.find((l) => l.isBestBuy);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center px-4 py-20 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18), transparent), #09090b",
      }}
    >
      {/* dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Hero */}
      <div className="animate-fade-in relative z-10 flex flex-col items-center gap-4 text-center mb-14">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300">
          ✦ Powered by AI
        </div>
        <h1
          className="text-6xl font-black tracking-tight"
          style={{
            background: "linear-gradient(135deg, #fff 30%, #a78bfa 70%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AutoMatch
        </h1>
        <p className="max-w-sm text-zinc-400 text-base leading-relaxed">
          Diz-nos o que procuras. A IA vai pesquisar anúncios reais e encontrar a melhor compra.
        </p>
      </div>

      {/* Form */}
      <div
        className="animate-slide-up relative z-10 w-full max-w-lg rounded-2xl border border-white/10 p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 24px 48px rgba(0,0,0,0.4)",
        }}
      >
        <VehicleForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="animate-fade-in relative z-10 mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-violet-500"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-400">{PHASE_LABELS[phase]}</p>
          <p className="text-xs text-zinc-600">Pode demorar 20–40 segundos</p>
        </div>
      )}

      {/* Error */}
      {phase === "error" && error && (
        <p className="animate-fade-in relative z-10 mt-8 text-sm text-red-400">{error}</p>
      )}

      {/* Results */}
      {phase === "done" && result && (
        <div className="animate-slide-up relative z-10 mt-14 w-full max-w-6xl flex flex-col gap-10">

          {/* Recommendation header */}
          <div className="text-center flex flex-col gap-3">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300 mx-auto">
              ✦ {result.make} {result.model} · {result.source}
            </div>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          {/* Best buy highlight */}
          {bestListing && (
            <div
              className="rounded-2xl border border-green-500/30 p-4 flex items-start gap-3"
              style={{ background: "rgba(34,197,94,0.05)" }}
            >
              <span className="text-xl">★</span>
              <div>
                <p className="text-sm font-semibold text-green-400">Melhor Compra segundo a IA</p>
                <p className="text-xs text-zinc-400 mt-0.5">{bestListing.title} — {bestListing.price}</p>
                {bestListing.aiNote && (
                  <p className="text-xs text-zinc-500 mt-1">{bestListing.aiNote}</p>
                )}
              </div>
            </div>
          )}

          {/* Listings grid */}
          {result.listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.listings.map((listing, i) => (
                  <div key={listing.id} className={`animate-slide-up stagger-${Math.min(i + 1, 3)}`}>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-zinc-600">
                {result.listings.length} anúncios encontrados em {result.source} · Clica para ver o anúncio original
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 p-10 text-center">
              <p className="text-zinc-400 text-sm">
                Não foi possível obter anúncios em tempo real.
              </p>
              <a
                href={result.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
              >
                Ver pesquisa em {result.source} →
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
