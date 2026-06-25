import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import type { VehiclePreferences, Listing } from "@/types/vehicle";

const REGION_NAMES: Record<string, string> = {
  pt: "Portugal", eu: "European Union", es: "Spain",
  de: "Germany",  fr: "France",        uk: "United Kingdom",
};

// ─── URL builders ────────────────────────────────────────────────────────────

function buildSearchUrl(make: string, model: string, prefs: VehiclePreferences): { url: string; source: string } {
  const query = `${make} ${model}`;

  if (prefs.region === "de") {
    const p = new URLSearchParams({ q: query, isSearchRequest: "true", scopeId: "C" });
    if (prefs.maxPrice) p.set("priceTo",  String(prefs.maxPrice));
    if (prefs.minPrice) p.set("priceFrom", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("millageTo", String(prefs.maxKm));
    if (prefs.minYear)  p.set("minFirstRegistrationDate", String(prefs.minYear));
    return { url: `https://suchen.mobile.de/fahrzeuge/search.html?${p}`, source: "Mobile.de" };
  }

  if (prefs.region === "uk") {
    const p = new URLSearchParams({ sort: "relevance", advertisingLocations: "at_cars" });
    p.set("make", make.toUpperCase());
    p.set("model", model.toUpperCase());
    if (prefs.maxPrice) p.set("price-to",         String(prefs.maxPrice));
    if (prefs.maxKm)    p.set("maximum-mileage",   String(Math.round(prefs.maxKm * 0.621)));
    if (prefs.minYear)  p.set("year-from",         String(prefs.minYear));
    return { url: `https://www.autotrader.co.uk/car-search?${p}`, source: "AutoTrader UK" };
  }

  if (["eu", "es", "fr"].includes(prefs.region)) {
    const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const p = new URLSearchParams({ atype: "C" });
    if (prefs.maxPrice) p.set("priceto",  String(prefs.maxPrice));
    if (prefs.minPrice) p.set("pricefrom", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("kmto",     String(prefs.maxKm));
    if (prefs.minYear)  p.set("fregfrom", String(prefs.minYear));
    if (prefs.maxYear)  p.set("fregto",   String(prefs.maxYear));
    return { url: `https://www.autoscout24.com/lst/${slug(make)}/${slug(model)}?${p}`, source: "AutoScout24" };
  }

  // Portugal: StandVirtual
  const p = new URLSearchParams();
  p.set("search[filter_str][0]", query);
  if (prefs.maxPrice) p.set("search[filter_float_price:to]",    String(prefs.maxPrice));
  if (prefs.minPrice) p.set("search[filter_float_price:from]",  String(prefs.minPrice));
  if (prefs.maxKm)    p.set("search[filter_float_mileage:to]",  String(prefs.maxKm));
  if (prefs.minYear)  p.set("search[filter_float_year:from]",   String(prefs.minYear));
  if (prefs.maxYear)  p.set("search[filter_float_year:to]",     String(prefs.maxYear));
  return { url: `https://www.standvirtual.com/carros?${p}`, source: "StandVirtual" };
}

// ─── OLX Portugal API ─────────────────────────────────────────────────────────

// OLX CDN image URLs contain {width}x{height} as a size template
function fixOlxImageUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace("{width}", "800").replace("{height}", "600");
}

// Find a param by key and return its value object
function olxParam(params: any[], key: string): any {
  return params.find((x: any) => x.key === key)?.value;
}

async function fetchOlxApi(make: string, model: string, prefs: VehiclePreferences): Promise<Listing[]> {
  const p = new URLSearchParams({
    query: `${make} ${model}`,
    offset: "0",
    limit: "20",
    sort_by: "relevancy_with_price_boost",
  });

  const res = await fetch(`https://www.olx.pt/api/v1/offers/?${p}`, {
    headers: { Accept: "application/json", "User-Agent": "AutoMatch/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`OLX API ${res.status}`);

  const json = await res.json();
  const items: any[] = json.data ?? [];
  if (items.length === 0) throw new Error("OLX returned 0 listings");

  // Apply client-side price/km/year filtering (API doesn't support refined filters without auth)
  const filtered = items.filter((item: any) => {
    const params: any[] = item.params ?? [];
    const priceVal  = olxParam(params, "price")?.value ?? 0;
    const yearVal   = Number(olxParam(params, "year")?.key ?? 0);
    const kmVal     = Number(olxParam(params, "quilometros")?.key ?? 0);

    if (prefs.minPrice && priceVal > 0 && priceVal < prefs.minPrice) return false;
    if (prefs.maxPrice && priceVal > 0 && priceVal > prefs.maxPrice) return false;
    if (prefs.minYear  && yearVal  > 0 && yearVal  < prefs.minYear)  return false;
    if (prefs.maxYear  && yearVal  > 0 && yearVal  > prefs.maxYear)  return false;
    if (prefs.maxKm    && kmVal    > 0 && kmVal    > prefs.maxKm)    return false;
    return true;
  });

  const toProcess = (filtered.length > 0 ? filtered : items).slice(0, 12);

  return toProcess.map((item: any, i: number) => {
    const params: any[] = item.params ?? [];

    // Price lives inside params with key "price"
    const priceObj  = olxParam(params, "price");
    const priceNum  = priceObj?.value ?? 0;
    const price     = priceNum > 0 ? `€${Number(priceNum).toLocaleString("pt-PT")}` : "—";

    // Mileage key in Portuguese OLX is "quilometros"
    const kmLabel   = olxParam(params, "quilometros")?.label;

    // Fuel key in Portuguese OLX is "combustivel"
    const fuelLabel = olxParam(params, "combustivel")?.label;

    // Gearbox
    const gearLabel = olxParam(params, "gearbox")?.label;

    // Year
    const yearKey   = olxParam(params, "year")?.key;

    // Prefer the StandVirtual external URL when available
    const listingUrl = item.external_url ?? item.url ?? "";
    const source     = item.external_url ? "StandVirtual" : "OLX Portugal";

    return {
      id: String(item.id ?? i),
      title: item.title ?? "Sem título",
      price,
      priceNum,
      year: yearKey ? Number(yearKey) : undefined,
      km: kmLabel ?? undefined,
      fuel: fuelLabel ?? undefined,
      transmission: gearLabel ?? undefined,
      location: item.location?.city?.name ?? item.location?.region?.name ?? undefined,
      imageUrl: fixOlxImageUrl(item.photos?.[0]?.link),
      listingUrl,
      source,
    } satisfies Listing;
  });
}

// ─── Strategy 2: direct HTML fetch + __NEXT_DATA__ JSON ──────────────────────

function scoreAsListingArray(arr: any[]): number {
  if (!arr.length) return 0;
  const s = JSON.stringify(arr[0]).toLowerCase();
  let score = 0;
  if (s.includes("price"))        score += 3;
  if (s.includes("url") || s.includes("href")) score += 2;
  if (s.includes("title") || s.includes("name")) score += 2;
  if (s.includes("photo") || s.includes("image")) score += 2;
  if (s.includes("km") || s.includes("mileage")) score += 3;
  if (s.includes("year") || s.includes("ano"))   score += 2;
  return score;
}

function findBestListingArray(obj: unknown, depth = 0): any[] | null {
  if (depth > 12) return null;
  let best: { arr: any[]; score: number } | null = null;

  if (Array.isArray(obj) && obj.length >= 2 && typeof obj[0] === "object") {
    const score = scoreAsListingArray(obj);
    if (score >= 5) best = { arr: obj, score };
  }

  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const val of Object.values(obj)) {
      const child = findBestListingArray(val, depth + 1);
      if (child) {
        const score = scoreAsListingArray(child);
        if (!best || score > best.score) best = { arr: child, score };
      }
    }
  }

  return best?.arr ?? null;
}

async function fetchViaHtml(url: string, source: string, searchUrl: string): Promise<Listing[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTML fetch ${res.status}`);

  const html = await res.text();

  // Extract __NEXT_DATA__
  const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nd) throw new Error("No __NEXT_DATA__");

  const nextData = JSON.parse(nd[1]);
  const arr = findBestListingArray(nextData);
  if (!arr || arr.length === 0) throw new Error("No listing array found");

  // Ask GPT to map the raw JSON array to our Listing schema
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Map this raw JSON array from a car marketplace page to our schema.
Return: { "listings": [{ "id","title","price"(string with €),"priceNum"(number),"year"(int|null),"km"(string|null),"fuel"(string|null),"transmission"(string|null),"location"(string|null),"imageUrl"(full URL or null — if template replace {width}→800 {height}→600),"listingUrl"(full URL; if relative prepend https://${new URL(url).hostname}),"source":"${source}" }] }
Extract up to 12 listings. Return {"listings":[]} if nothing found.`,
      },
      {
        role: "user",
        content: JSON.stringify(arr.slice(0, 12)).substring(0, 14000),
      },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(completion.choices[0].message.content ?? "{}");
  return (data.listings as Listing[]) ?? [];
}

// ─── Strategy 3: Jina AI reader ──────────────────────────────────────────────

async function fetchViaJina(url: string, source: string, searchUrl: string): Promise<Listing[]> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(jinaUrl, {
    headers: {
      Accept: "text/markdown",
      "X-Timeout": "25",
      "X-No-Cache": "true",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Jina ${res.status}`);
  const content = await res.text();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Extract used car listings from this car marketplace page content.
Return: { "listings": [{ "id","title","price"(string with €),"priceNum"(number),"year"(int|null),"km"(string|null),"fuel"(string|null),"transmission"(string|null),"location"(string|null),"imageUrl"(full URL or null),"listingUrl"(full URL; fallback "${searchUrl}"),"source":"${source}" }] }
Up to 12 listings. Return {"listings":[]} if no listings found (e.g. captcha or error page).`,
      },
      { role: "user", content: content.substring(0, 12000) },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(completion.choices[0].message.content ?? "{}");
  return (data.listings as Listing[]) ?? [];
}

// ─── AI validation ────────────────────────────────────────────────────────────

async function validateListings(listings: Listing[], prefs: VehiclePreferences): Promise<Listing[]> {
  if (listings.length === 0) return [];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert used car buyer. Score each listing 1–10 considering value for money, mileage/age balance, and match to user preferences. Pick exactly ONE as the best buy.

User preferences: budget €${prefs.minPrice ?? 0}–€${prefs.maxPrice ?? "unlimited"}, max ${prefs.maxKm ?? "any"} km, year ${prefs.minYear ?? "any"}–${prefs.maxYear ?? "any"}, fuel=${prefs.fuelType || "any"}, gearbox=${prefs.transmission || "any"}, usage=${prefs.usage || "any"}.

Return JSON: { "listings": [{ "id", "aiScore": 1-10, "aiNote": "one sentence", "isBestBuy": bool }] }`,
      },
      {
        role: "user",
        content: JSON.stringify(
          listings.map(({ id, title, price, priceNum, year, km, fuel, transmission }) => ({
            id, title, price, priceNum, year, km, fuel, transmission,
          }))
        ),
      },
    ],
    response_format: { type: "json_object" },
  });

  const scored: Array<{ id: string; aiScore: number; aiNote: string; isBestBuy: boolean }> =
    JSON.parse(completion.choices[0].message.content ?? "{}").listings ?? [];

  const scoreMap = new Map(scored.map((s) => [s.id, s]));
  return listings.map((l) => {
    const s = scoreMap.get(l.id);
    return s ? { ...l, aiScore: s.aiScore, aiNote: s.aiNote, isBestBuy: s.isBestBuy } : l;
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const prefs: VehiclePreferences = await req.json();
  const regionName = REGION_NAMES[prefs.region] ?? prefs.region;

  // Step 1 — GPT picks the best model to search for
  const modelCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Return ONLY JSON: { "make": "<brand>", "model": "<model>", "recommendation": "<2 sentence summary>" }
Best used car for ${regionName}: brand=${prefs.brand || "any"}, model=${prefs.model || "any"}, budget €${prefs.minPrice ?? 0}–€${prefs.maxPrice ?? "unlimited"}, max ${prefs.maxKm ?? "any"} km, year ${prefs.minYear ?? "any"}–${prefs.maxYear ?? "any"}, fuel=${prefs.fuelType || "any"}, gearbox=${prefs.transmission || "any"}, body=${prefs.bodyType || "any"}, seats=${prefs.seats ?? "any"}, usage=${prefs.usage || "any"}, notes=${prefs.extraNotes || "none"}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const modelData = JSON.parse(modelCompletion.choices[0].message.content ?? "{}");
  const make: string = modelData.make ?? prefs.brand ?? "Toyota";
  const model: string = modelData.model ?? prefs.model ?? "Corolla";
  const recommendation: string = modelData.recommendation ?? "";

  const { url: searchUrl, source } = buildSearchUrl(make, model, prefs);

  // Step 2 — Try to fetch real listings (3 strategies in order)
  let rawListings: Listing[] = [];
  let usedSource = source;

  if (prefs.region === "pt") {
    // Strategy A: OLX Portugal public API (clean JSON, no scraping needed)
    try {
      rawListings = await fetchOlxApi(make, model, prefs);
      usedSource = "OLX Portugal";
      console.log(`✓ OLX API: ${rawListings.length} listings`);
    } catch (e) {
      console.warn("OLX API failed:", e);
    }
  }

  // Strategy B: Direct HTML + __NEXT_DATA__ (works for most Next.js sites)
  if (rawListings.length === 0) {
    try {
      rawListings = await fetchViaHtml(searchUrl, source, searchUrl);
      console.log(`✓ HTML __NEXT_DATA__: ${rawListings.length} listings`);
    } catch (e) {
      console.warn("HTML fetch failed:", e);
    }
  }

  // Strategy C: Jina AI reader (renders JS, works even for SPA sites)
  if (rawListings.length === 0) {
    try {
      rawListings = await fetchViaJina(searchUrl, source, searchUrl);
      console.log(`✓ Jina: ${rawListings.length} listings`);
    } catch (e) {
      console.warn("Jina failed:", e);
    }
  }

  // Step 3 — AI scores and picks best buy
  const listings = rawListings.length > 0
    ? await validateListings(rawListings, prefs)
    : [];

  return NextResponse.json({ recommendation, make, model, listings, searchUrl, source: usedSource });
}
