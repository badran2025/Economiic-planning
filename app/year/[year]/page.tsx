import Link from "next/link";
import { getMonthlyTotals, getYearTotals } from "@/lib/queries";
import { HeroTotals, TotalsStrip } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import { monthName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);

  let yearTotals, months;
  try {
    [yearTotals, months] = await Promise.all([getYearTotals(year), getMonthlyTotals(year)]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <section>
        <div style={{ marginBottom: "0.9rem" }}>
          <Link href="/" className="muted" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
            ← الرئيسية
          </Link>
          <h1 style={{ margin: "0.3rem 0 0", fontSize: "1.8rem" }}>سنة {year}</h1>
        </div>
        <HeroTotals totals={yearTotals} />
      </section>

      <section>
        <h2 style={{ margin: "0 0 0.9rem", fontSize: "1.2rem" }}>الشهور</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "1rem",
          }}
        >
          {months.map((m) => {
            const empty = m.income === 0 && m.expenses === 0 && m.investment === 0;
            return (
              <Link
                key={m.month}
                href={`/year/${year}/month/${m.month}`}
                className="card card-link"
                style={{
                  padding: "1rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  opacity: empty ? 0.72 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>{monthName(m.month)}</span>
                  <span className="chip">{empty ? "فاضي" : "تفاصيل ←"}</span>
                </div>
                <TotalsStrip totals={m} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
