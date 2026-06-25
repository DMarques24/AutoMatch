import type { MatchResult } from "@/types/vehicle";

interface Props {
  result: MatchResult;
}

export default function MatchResult({ result }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <p className="text-sm text-zinc-600">{result.recommendation}</p>
      <div className="flex flex-col gap-4">
        {result.topPicks.map((pick, i) => (
          <div key={i} className="border rounded-lg p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{pick.name}</span>
              <span className="text-sm text-zinc-500">{pick.estimatedPrice}</span>
            </div>
            <p className="text-sm text-zinc-600">{pick.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
