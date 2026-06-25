export interface VehiclePreferences {
  model: string;
  maxPrice: number;
  maxKm: number;
  year?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  extraNotes?: string;
}

export interface MatchResult {
  recommendation: string;
  topPicks: VehiclePick[];
}

export interface VehiclePick {
  name: string;
  reason: string;
  estimatedPrice: string;
}
