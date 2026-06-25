import type { VehiclePreferences } from "@/types/vehicle";

export interface Platform {
  id: string;
  name: string;
  flag: string;
  bg: string;
  text: string;
  buildUrl: (make: string, model: string, prefs: VehiclePreferences) => string;
}

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Platform definitions ───────────────────────────────────────────────────

const standvirtual: Platform = {
  id: "standvirtual",
  name: "StandVirtual",
  flag: "🇵🇹",
  bg: "#c0392b",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams();
    p.set("search[filter_str][0]", `${make} ${model}`);
    if (prefs.maxPrice) p.set("search[filter_float_price:to]",    String(prefs.maxPrice));
    if (prefs.minPrice) p.set("search[filter_float_price:from]",  String(prefs.minPrice));
    if (prefs.maxKm)    p.set("search[filter_float_mileage:to]",  String(prefs.maxKm));
    if (prefs.minYear)  p.set("search[filter_float_year:from]",   String(prefs.minYear));
    if (prefs.maxYear)  p.set("search[filter_float_year:to]",     String(prefs.maxYear));
    return `https://www.standvirtual.com/carros?${p}`;
  },
};

const olxPt: Platform = {
  id: "olx-pt",
  name: "OLX Portugal",
  flag: "🇵🇹",
  bg: "#1a2e35",
  text: "#4dbf8b",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams();
    p.set("search[filter_str]", `${make} ${model}`);
    if (prefs.maxPrice) p.set("search[filter_float_price:to]",   String(prefs.maxPrice));
    if (prefs.minPrice) p.set("search[filter_float_price:from]", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("search[filter_float_mileage:to]", String(prefs.maxKm));
    return `https://www.olx.pt/carros-motos-e-barcos/carros/?${p}`;
  },
};

const custoJusto: Platform = {
  id: "custojusto",
  name: "CustoJusto",
  flag: "🇵🇹",
  bg: "#006400",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ q: `${make} ${model}` });
    if (prefs.maxPrice) p.set("price_max", String(prefs.maxPrice));
    if (prefs.minPrice) p.set("price_min", String(prefs.minPrice));
    return `https://www.custojusto.pt/todo-o-pais/carros?${p}`;
  },
};

const autoScout24Pt: Platform = {
  id: "autoscout24-pt",
  name: "AutoScout24 PT",
  flag: "🇵🇹",
  bg: "#f5a623",
  text: "#000",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ atype: "C", cy: "P" });
    if (prefs.maxPrice) p.set("priceto",  String(prefs.maxPrice));
    if (prefs.minPrice) p.set("pricefrom", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("kmto",     String(prefs.maxKm));
    if (prefs.minYear)  p.set("fregfrom", String(prefs.minYear));
    if (prefs.maxYear)  p.set("fregto",   String(prefs.maxYear));
    return `https://www.autoscout24.pt/lst/${slug(make)}/${slug(model)}?${p}`;
  },
};

const autoScout24Eu: Platform = {
  id: "autoscout24-eu",
  name: "AutoScout24 EU",
  flag: "🇪🇺",
  bg: "#f5a623",
  text: "#000",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ atype: "C" });
    if (prefs.maxPrice) p.set("priceto",  String(prefs.maxPrice));
    if (prefs.minPrice) p.set("pricefrom", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("kmto",     String(prefs.maxKm));
    if (prefs.minYear)  p.set("fregfrom", String(prefs.minYear));
    if (prefs.maxYear)  p.set("fregto",   String(prefs.maxYear));
    return `https://www.autoscout24.com/lst/${slug(make)}/${slug(model)}?${p}`;
  },
};

const mobileDe: Platform = {
  id: "mobile-de",
  name: "Mobile.de",
  flag: "🇩🇪",
  bg: "#e60000",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ q: `${make} ${model}`, isSearchRequest: "true", scopeId: "C" });
    if (prefs.maxPrice) p.set("priceTo",  String(prefs.maxPrice));
    if (prefs.minPrice) p.set("priceFrom", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("millageTo", String(prefs.maxKm));
    if (prefs.minYear)  p.set("minFirstRegistrationDate", String(prefs.minYear));
    return `https://suchen.mobile.de/fahrzeuge/search.html?${p}`;
  },
};

const kleinanzeigen: Platform = {
  id: "kleinanzeigen",
  name: "Kleinanzeigen",
  flag: "🇩🇪",
  bg: "#374151",
  text: "#34d399",
  buildUrl: (make, model) =>
    `https://www.kleinanzeigen.de/s-autos/${slug(make)}-${slug(model)}/k0c216`,
};

const cochesNet: Platform = {
  id: "coches-net",
  name: "Coches.net",
  flag: "🇪🇸",
  bg: "#0057a8",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams();
    if (prefs.maxPrice) p.set("precio-hasta", String(prefs.maxPrice));
    if (prefs.minPrice) p.set("precio-desde", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("km-hasta",     String(prefs.maxKm));
    if (prefs.minYear)  p.set("ano-desde",    String(prefs.minYear));
    return `https://www.coches.net/segunda-mano/${slug(make)}-${slug(model)}.htm?${p}`;
  },
};

const wallapop: Platform = {
  id: "wallapop",
  name: "Wallapop",
  flag: "🇪🇸",
  bg: "#13c1ac",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ keywords: `${make} ${model}`, category_ids: "100" });
    if (prefs.maxPrice) p.set("max_sale_price", String(prefs.maxPrice));
    if (prefs.minPrice) p.set("min_sale_price", String(prefs.minPrice));
    return `https://es.wallapop.com/app/search?${p}`;
  },
};

const laCentrale: Platform = {
  id: "lacentrale",
  name: "La Centrale",
  flag: "🇫🇷",
  bg: "#0b3d91",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ q: `${make} ${model}` });
    if (prefs.maxPrice) p.set("pricemax", String(prefs.maxPrice));
    if (prefs.minPrice) p.set("pricemin", String(prefs.minPrice));
    if (prefs.maxKm)    p.set("kmmax",    String(prefs.maxKm));
    return `https://www.lacentrale.fr/listing?${p}`;
  },
};

const leboncoin: Platform = {
  id: "leboncoin",
  name: "leboncoin",
  flag: "🇫🇷",
  bg: "#f56b2a",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ text: `${make} ${model}` });
    if (prefs.maxPrice) p.set("price", `1-${prefs.maxPrice}`);
    return `https://www.leboncoin.fr/voitures/offres?${p}`;
  },
};

const autotraderUk: Platform = {
  id: "autotrader-uk",
  name: "AutoTrader UK",
  flag: "🇬🇧",
  bg: "#fa6400",
  text: "#fff",
  buildUrl: (make, model, prefs) => {
    const p = new URLSearchParams({ sort: "relevance", advertisingLocations: "at_cars" });
    p.set("make", make.toUpperCase());
    p.set("model", model.toUpperCase());
    if (prefs.maxPrice) p.set("price-to",   String(prefs.maxPrice));
    if (prefs.minPrice) p.set("price-from",  String(prefs.minPrice));
    if (prefs.maxKm)    p.set("maximum-mileage", String(Math.round(prefs.maxKm * 0.621)));
    if (prefs.minYear)  p.set("year-from",   String(prefs.minYear));
    return `https://www.autotrader.co.uk/car-search?${p}`;
  },
};

const facebook: Platform = {
  id: "facebook",
  name: "Facebook Marketplace",
  flag: "🌍",
  bg: "#1877f2",
  text: "#fff",
  buildUrl: (make, model) =>
    `https://www.facebook.com/marketplace/search?query=${encodeURIComponent(`${make} ${model}`)}&exact=false`,
};

// ─── Region → platforms ──────────────────────────────────────────────────────

export const REGIONS: { value: string; label: string }[] = [
  { value: "pt",  label: "🇵🇹 Portugal" },
  { value: "eu",  label: "🇪🇺 União Europeia" },
  { value: "es",  label: "🇪🇸 Espanha" },
  { value: "de",  label: "🇩🇪 Alemanha" },
  { value: "fr",  label: "🇫🇷 França" },
  { value: "uk",  label: "🇬🇧 Reino Unido" },
];

export const PLATFORMS_BY_REGION: Record<string, Platform[]> = {
  pt: [standvirtual, olxPt, custoJusto, autoScout24Pt, facebook],
  eu: [autoScout24Eu, mobileDe, standvirtual, facebook],
  es: [cochesNet, wallapop, autoScout24Eu, facebook],
  de: [mobileDe, kleinanzeigen, autoScout24Eu, facebook],
  fr: [laCentrale, leboncoin, autoScout24Eu, facebook],
  uk: [autotraderUk, autoScout24Eu, facebook],
};
