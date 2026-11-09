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
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.9rem",
      }}
    >
      {ORDER.map((k) => (
        <div key={k} className="card" style={{ padding: "1.1rem 1.2rem" }}>
          <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            {META[k].label}
          </div>
          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: META[k].color,
              lineHeight: 1.15,
            }}
          >
            {fmtEgp(totals[k])}
          </div>
          <div className="muted" style={{ fontSize: "0.78rem" }}>
            جنيه مصري
          </div>
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
        gap: "0.5rem 0.9rem",
        fontSize: "0.9rem",
      }}
    >
      {ORDER.map((k) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "0.4rem" }}>
          <span className="muted">{META[k].label}</span>
          <span style={{ fontWeight: 700, color: META[k].color }}>{fmtEgp(totals[k])}</span>
        </div>
      ))}
    </div>
  );
}
