import { fmtEgp } from "@/lib/format";
import type { Totals } from "@/lib/queries";

const META = {
  income: { label: "الدخل", color: "var(--income)" },
  expenses: { label: "المصروفات", color: "var(--expense)" },
  investment: { label: "الاستثمار", color: "var(--invest)" },
  net: { label: "المتبقّي", color: "var(--net)" },
} as const;

type Key = keyof typeof META;
const ORDER: Key[] = ["income", "expenses", "investment", "net"];

export function HeroTotals({ totals }: { totals: Totals }) {
  return (
    <div
      className="grid-auto"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
    >
      {ORDER.map((k) => (
        <div
          key={k}
          className="card stat"
          style={{ "--accent": META[k].color } as React.CSSProperties}
        >
          <div className="stat-label">
            <span className="stat-dot" />
            {META[k].label}
          </div>
          <div className="stat-value">{fmtEgp(totals[k])}</div>
          <div className="stat-unit">جنيه مصري</div>
        </div>
      ))}
    </div>
  );
}

export function TotalsStrip({ totals }: { totals: Totals }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.45rem 0.9rem",
        fontSize: "0.9rem",
      }}
    >
      {ORDER.map((k) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "0.4rem" }}>
          <span className="muted">{META[k].label}</span>
          <span className="num" style={{ fontWeight: 700, color: META[k].color }}>
            {fmtEgp(totals[k])}
          </span>
        </div>
      ))}
    </div>
  );
}
