import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import type { VehiclePreferences } from "@/types/vehicle";

export async function POST(req: NextRequest) {
  const body: VehiclePreferences = await req.json();

  const prompt = `You are an expert car advisor. Based on the user's preferences below, recommend the top 3 vehicles that best match their needs.

Preferences:
- Model / type in mind: ${body.model || "any"}
- Max price: €${body.maxPrice?.toLocaleString() ?? "not specified"}
- Max mileage: ${body.maxKm?.toLocaleString() ?? "not specified"} km
- Year: ${body.year ?? "any"}
- Fuel type: ${body.fuelType ?? "any"}
- Transmission: ${body.transmission ?? "any"}
- Body type: ${body.bodyType ?? "any"}
- Extra notes: ${body.extraNotes || "none"}

Respond ONLY with a valid JSON object in this exact shape:
{
  "recommendation": "<2-3 sentence overall summary>",
  "topPicks": [
    { "name": "<Make Model Year>", "reason": "<why it fits>", "estimatedPrice": "<price range>" },
    { "name": "...", "reason": "...", "estimatedPrice": "..." },
    { "name": "...", "reason": "...", "estimatedPrice": "..." }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0].message.content ?? "{}");
  return NextResponse.json(result);
}
