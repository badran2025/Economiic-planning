import Link from "next/link";
import { getGrandTotals, getYearsWithTotals } from "@/lib/queries";
import { HeroTotals, TotalsStrip } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import { addYear, loadDefaults } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let totals, years;
  try {
    [totals, years] = await Promise.all([getGrandTotals(), getYearsWithTotals()]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const nextYear = new Date().getFullYear();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <section>
        <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem" }}>الملخّص الإجمالي</h1>
        <p className="muted" style={{ margin: "0 0 1rem" }}>
          كل الأرقام بالجنيه المصري، ومجمّعة تلقائياً من كل الشهور والسنين.
        </p>
        <HeroTotals totals={totals} />
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "0.9rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>السنوات</h2>
          <form action={addYear} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="field"
              type="number"
              name="year"
              defaultValue={nextYear}
              min={2000}
              max={2100}
              style={{ width: 120 }}
              aria-label="السنة"
            />
            <button className="btn btn-primary" type="submit">
              + إضافة سنة
            </button>
          </form>
        </div>

        {years.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
            <p style={{ marginTop: 0 }}>مفيش سنين لسه. أضف سنة من فوق عشان تبدأ.</p>
            <form action={loadDefaults}>
              <button className="btn" type="submit">
                تحميل التصنيفات الافتراضية (أشخاص/أنواع/مصادر دخل/وجهات استثمار)
              </button>
            </form>
            <p className="muted" style={{ fontSize: "0.8rem", marginBottom: 0 }}>
              اختياري — تقدر تعدّلها أو تحذفها بعدين من الإعدادات.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "1rem",
            }}
          >
            {years.map((y) => (
              <Link
                key={y.year}
                href={`/year/${y.year}`}
                className="card"
                style={{
                  padding: "1.1rem 1.2rem",
                  textDecoration: "none",
                  color: "var(--text)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  transition: "transform 0.12s ease, border-color 0.12s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>{y.year}</span>
                  <span className="chip">عرض الشهور ←</span>
                </div>
                <TotalsStrip totals={y} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
