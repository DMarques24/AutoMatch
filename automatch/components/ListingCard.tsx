"use client";

import { useState } from "react";
import type { Listing } from "@/types/vehicle";

interface Props {
  listing: Listing;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "#22c55e" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {score}/10
    </span>
  );
}

export default function ListingCard({ listing }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={listing.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 no-underline"
      style={{
        borderColor: listing.isBestBuy ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)",
        background: listing.isBestBuy
          ? "radial-gradient(ellipse at top, rgba(34,197,94,0.08), transparent 70%), rgba(15,15,20,0.97)"
          : "rgba(15,15,20,0.97)",
        boxShadow: listing.isBestBuy
          ? "0 0 0 1px rgba(34,197,94,0.2), 0 12px 40px rgba(0,0,0,0.4)"
          : "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
        {listing.imageUrl && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 80 40" fill="none" className="w-20 text-zinc-700">
              <path d="M10 28h60M12 28l6-12h32l6 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 16l4-8h24l4 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22" cy="30" r="5" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="58" cy="30" r="5" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </div>
        )}

        {/* overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 50%)" }} />

        {/* Best buy badge */}
        {listing.isBestBuy && (
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            ★ Melhor Compra
          </div>
        )}

        {/* Source chip */}
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-zinc-300 backdrop-blur-sm">
          {listing.source}
        </span>

        {/* Price */}
        <span className="absolute bottom-2 left-2 text-lg font-black text-white drop-shadow-lg">
          {listing.price || "—"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{listing.title}</h3>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
          {listing.year && <span>📅 {listing.year}</span>}
          {listing.km   && <span>🛣 {listing.km}</span>}
          {listing.fuel && <span>⛽ {listing.fuel}</span>}
          {listing.transmission && <span>⚙️ {listing.transmission}</span>}
          {listing.location     && <span>📍 {listing.location}</span>}
        </div>

        {/* AI note */}
        {listing.aiNote && (
          <div className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
            {listing.aiScore !== undefined && <ScoreBadge score={listing.aiScore} />}
            <p className="text-xs text-zinc-400 leading-relaxed">{listing.aiNote}</p>
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-all duration-200 group-hover:gap-2.5"
          style={{
            background: listing.isBestBuy
              ? "linear-gradient(135deg, rgba(34,197,94,0.4), rgba(16,185,129,0.4))"
              : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Ver anúncio
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </a>
  );
}
