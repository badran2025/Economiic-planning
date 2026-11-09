import { fmtEgp } from "@/lib/format";
import type { PlanSummary, Totals } from "@/lib/queries";

function Row({
  label,
  planned,
  actual,
  goodWhenHigher,
}: {
  label: string;
  planned: number;
  actual: number;
  goodWhenHigher: boolean;
}) {
  const diff = actual - planned;
  const good = goodWhenHigher ? diff >= 0 : diff <= 0;
  const color = diff === 0 ? "var(--text-muted)" : good ? "var(--income)" : "var(--expense)";
  const sign = diff > 0 ? "+" : "";
  return (
    <tr>
      <td>{label}</td>
      <td className="muted">{fmtEgp(planned)}</td>
      <td style={{ fontWeight: 700 }}>{fmtEgp(actual)}</td>
      <td style={{ color, fontWeight: 700 }}>
        {sign}
        {fmtEgp(diff)}
      </td>
    </tr>
  );
}

export function PlanComparison({ plan, actual }: { plan: PlanSummary; actual: Totals }) {
  const hasPlan =
    plan.plannedIncome > 0 || plan.plannedExpenses > 0 || plan.plannedInvestment > 0;

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.1rem" }}>الخطة مقابل الفعلي</h3>
      <p className="muted" style={{ margin: "0 0 0.9rem", fontSize: "0.82rem" }}>
        الخطة هي الهدف الشهري الثابت (من الإعدادات): الدخل من المصادر الثابتة، والمصروفات من بنود
        الخطة، والاستثمار من توزيع الفائض على الوجهات.
      </p>
      {!hasPlan ? (
        <p className="muted" style={{ textAlign: "center" }}>
          لسه مفيش خطة. حدّد مصادر الدخل الثابتة وبنود المصروفات المخطّطة ووجهات الاستثمار من{" "}
          <a href="/settings" style={{ color: "var(--brand)" }}>الإعدادات</a>.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>البند</th>
                <th>المخطّط</th>
                <th>الفعلي</th>
                <th>الفرق</th>
              </tr>
            </thead>
            <tbody>
              <Row label="الدخل" planned={plan.plannedIncome} actual={actual.income} goodWhenHigher />
              <Row
                label="المصروفات"
                planned={plan.plannedExpenses}
                actual={actual.expenses}
                goodWhenHigher={false}
              />
              <Row
                label="الاستثمار"
                planned={plan.plannedInvestment}
                actual={actual.investment}
                goodWhenHigher
              />
              <Row
                label="المتبقّي"
                planned={plan.plannedIncome - plan.plannedExpenses - plan.plannedInvestment}
                actual={actual.net}
                goodWhenHigher
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
