"use client";

import { useState } from "react";
import type { VehiclePreferences } from "@/types/vehicle";
import { REGIONS } from "@/lib/platforms";

interface Props {
  onSubmit: (prefs: VehiclePreferences) => void;
  loading: boolean;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20";

const selectClass =
  "w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 cursor-pointer";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

const POPULAR_BRANDS = [
  "Audi", "BMW", "Citroën", "Dacia", "Fiat", "Ford", "Honda",
  "Hyundai", "Kia", "Mazda", "Mercedes-Benz", "Mitsubishi",
  "Nissan", "Opel", "Peugeot", "Renault", "Seat", "Skoda",
  "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const USAGE_OPTIONS = [
  { value: "city",     label: "🏙 Cidade" },
  { value: "highway",  label: "🛣 Estrada" },
  { value: "mixed",    label: "🔀 Misto" },
  { value: "family",   label: "👨‍👩‍👧 Família" },
  { value: "sport",    label: "🏎 Desporto" },
  { value: "offroad",  label: "🏔 Off-road" },
];

export default function VehicleForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<VehiclePreferences>({
    brand: "",
    model: "",
    minPrice: 0,
    maxPrice: 0,
    maxKm: 0,
    minYear: undefined,
    maxYear: undefined,
    fuelType: "",
    transmission: "",
    bodyType: "",
    seats: undefined,
    usage: "",
    region: "pt",
    extraNotes: "",
  });

  function set(name: string, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    const numFields = ["minPrice", "maxPrice", "maxKm", "minYear", "maxYear", "seats"];
    set(name, numFields.includes(name) ? (value === "" ? undefined : Number(value)) : value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">

      {/* Region */}
      <Section title="Onde procurar">
        <div className="grid grid-cols-3 gap-2">
          {REGIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("region", value)}
              className="rounded-lg border py-2.5 text-xs font-medium transition-all duration-150"
              style={{
                borderColor: form.region === value ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)",
                background:  form.region === value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                color:       form.region === value ? "#c4b5fd" : "#a1a1aa",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Vehicle */}
      <Section title="Veículo">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Marca</Label>
            <select name="brand" value={form.brand} onChange={handleChange} className={selectClass}>
              <option value="">Qualquer marca</option>
              {POPULAR_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Modelo</Label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="ex: Civic, Golf, 308"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Carroçaria</Label>
            <select name="bodyType" value={form.bodyType} onChange={handleChange} className={selectClass}>
              <option value="">Qualquer</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV / Crossover</option>
              <option value="hatchback">Hatchback</option>
              <option value="coupe">Coupé</option>
              <option value="wagon">Station Wagon</option>
              <option value="van">Monovolume / Van</option>
              <option value="pickup">Pickup</option>
              <option value="convertible">Descapotável</option>
            </select>
          </div>
          <div>
            <Label>Lugares</Label>
            <select name="seats" value={form.seats ?? ""} onChange={handleChange} className={selectClass}>
              <option value="">Qualquer</option>
              <option value="2">2 lugares</option>
              <option value="4">4 lugares</option>
              <option value="5">5 lugares</option>
              <option value="7">7 lugares</option>
              <option value="8">8+ lugares</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Budget */}
      <Section title="Orçamento">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Preço mínimo (€)</Label>
            <input
              name="minPrice"
              type="number"
              min={0}
              value={form.minPrice || ""}
              onChange={handleChange}
              placeholder="ex: 5 000"
              className={inputClass}
            />
          </div>
          <div>
            <Label>Preço máximo (€)</Label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              value={form.maxPrice || ""}
              onChange={handleChange}
              placeholder="ex: 20 000"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* Condition */}
      <Section title="Condição e Idade">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ano desde</Label>
            <input
              name="minYear"
              type="number"
              min={1990}
              max={2025}
              value={form.minYear ?? ""}
              onChange={handleChange}
              placeholder="ex: 2016"
              className={inputClass}
            />
          </div>
          <div>
            <Label>Ano até</Label>
            <input
              name="maxYear"
              type="number"
              min={1990}
              max={2025}
              value={form.maxYear ?? ""}
              onChange={handleChange}
              placeholder="ex: 2022"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <Label>Quilometragem máxima</Label>
          <input
            name="maxKm"
            type="number"
            min={0}
            value={form.maxKm || ""}
            onChange={handleChange}
            placeholder="ex: 120 000 km"
            className={inputClass}
          />
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferências">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Combustível</Label>
            <select name="fuelType" value={form.fuelType} onChange={handleChange} className={selectClass}>
              <option value="">Qualquer</option>
              <option value="petrol">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Híbrido</option>
              <option value="plugin-hybrid">Plug-in Híbrido</option>
              <option value="electric">Elétrico</option>
              <option value="lpg">GPL</option>
            </select>
          </div>
          <div>
            <Label>Transmissão</Label>
            <select name="transmission" value={form.transmission} onChange={handleChange} className={selectClass}>
              <option value="">Qualquer</option>
              <option value="automatic">Automático</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Utilização principal</Label>
          <div className="grid grid-cols-3 gap-2">
            {USAGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("usage", form.usage === value ? "" : value)}
                className="rounded-lg border py-2 text-xs font-medium transition-all duration-150"
                style={{
                  borderColor: form.usage === value ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)",
                  background:  form.usage === value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                  color:       form.usage === value ? "#c4b5fd" : "#a1a1aa",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Notas adicionais</Label>
          <textarea
            name="extraNotes"
            value={form.extraNotes}
            onChange={handleChange}
            rows={2}
            placeholder="Baixo seguro, bom para viagens longas, mala grande..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: loading
            ? "rgba(124,58,237,0.6)"
            : "linear-gradient(135deg, #7c3aed, #2563eb)",
          boxShadow: loading ? "none" : "0 0 28px rgba(124,58,237,0.4)",
        }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            A encontrar o teu veículo…
          </>
        ) : (
          "Encontrar o meu veículo →"
        )}
      </button>
    </form>
  );
}
