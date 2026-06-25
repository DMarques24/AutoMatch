"use client";

import { useState } from "react";
import type { VehiclePreferences } from "@/types/vehicle";

interface Props {
  onSubmit: (prefs: VehiclePreferences) => void;
  loading: boolean;
}

export default function VehicleForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<VehiclePreferences>({
    model: "",
    maxPrice: 0,
    maxKm: 0,
    year: undefined,
    fuelType: "",
    transmission: "",
    bodyType: "",
    extraNotes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["maxPrice", "maxKm", "year"].includes(name)
        ? value === "" ? undefined : Number(value)
        : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-lg">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Vehicle model or type</label>
        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          placeholder="e.g. SUV, Honda Civic, Tesla Model 3"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Max price (€)</label>
          <input
            name="maxPrice"
            type="number"
            min={0}
            value={form.maxPrice || ""}
            onChange={handleChange}
            placeholder="e.g. 15000"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Max mileage (km)</label>
          <input
            name="maxKm"
            type="number"
            min={0}
            value={form.maxKm || ""}
            onChange={handleChange}
            placeholder="e.g. 100000"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Min year</label>
          <input
            name="year"
            type="number"
            min={1990}
            max={2025}
            value={form.year || ""}
            onChange={handleChange}
            placeholder="e.g. 2018"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fuel type</label>
          <select
            name="fuelType"
            value={form.fuelType}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Transmission</label>
          <select
            name="transmission"
            value={form.transmission}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Body type</label>
          <select
            name="bodyType"
            value={form.bodyType}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="coupe">Coupe</option>
            <option value="van">Van</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Extra notes</label>
        <textarea
          name="extraNotes"
          value={form.extraNotes}
          onChange={handleChange}
          rows={3}
          placeholder="Anything else? e.g. low insurance, good for families, sporty..."
          className="border rounded px-3 py-2 text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded px-5 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Finding your match..." : "Find my vehicle"}
      </button>
    </form>
  );
}
