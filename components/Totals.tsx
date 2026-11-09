import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fmtEgp } from "@/lib/format";
import type { Totals } from "@/lib/queries";

const META: Record<keyof Totals, { label: string; dot: string; text: string }> = {
  income: { label: "الدخل", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  expenses: { label: "المصروفات", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  investment: { label: "الاستثمار", dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  net: { label: "المتبقّي", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
};

const ORDER: (keyof Totals)[] = ["income", "expenses", "investment", "net"];

export function HeroTotals({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ORDER.map((k) => (
        <Card key={k} className="gap-1.5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("size-2 rounded-full", META[k].dot)} />
            {META[k].label}
          </div>
          <div className={cn("text-2xl font-extrabold tabular-nums", META[k].text)}>
            {fmtEgp(totals[k])}
          </div>
          <div className="text-xs text-muted-foreground">جنيه مصري</div>
        </Card>
      ))}
    </div>
  );
}

export function TotalsStrip({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {ORDER.map((k) => (
        <div key={k} className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{META[k].label}</span>
          <span className={cn("font-bold tabular-nums", META[k].text)}>{fmtEgp(totals[k])}</span>
        </div>
      ))}
    </div>
  );
}
