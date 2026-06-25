export interface VehiclePreferences {
  brand: string;
  model: string;
  minPrice: number;
  maxPrice: number;
  maxKm: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  seats?: number;
  usage?: string;
  region: string;
  extraNotes?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  year?: number;
  km?: string;
  fuel?: string;
  transmission?: string;
  location?: string;
  imageUrl?: string;
  listingUrl: string;
  source: string;
  isBestBuy?: boolean;
  aiScore?: number;
  aiNote?: string;
}

export interface SearchResult {
  recommendation: string;
  make: string;
  model: string;
  listings: Listing[];
}
