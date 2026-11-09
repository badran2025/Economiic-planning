import Link from "next/link";
import {
  getCategories,
  getInvestmentDestinations,
  getMonthExpenses,
  getMonthIncome,
  getMonthInvestments,
  getMonthTotals,
  getPeople,
  getPlanSummary,
} from "@/lib/queries";
import { HeroTotals } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import MonthSection, { type AnyEntry } from "@/components/MonthSection";
import { PlanComparison } from "@/components/PlanComparison";
import { monthName } from "@/lib/constants";
import {
  addExpenseEntry,
  addIncomeEntry,
  addInvestmentEntry,
  deleteExpenseEntry,
  deleteIncomeEntry,
  deleteInvestmentEntry,
  generateRecurringIncome,
  updateExpenseEntry,
  updateIncomeEntry,
  updateInvestmentEntry,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function MonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year: yearStr, month: monthStr } = await params;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  let totals, income, expenses, investments, people, categories, destinations, plan;
  try {
    [totals, income, expenses, investments, people, categories, destinations, plan] =
      await Promise.all([
        getMonthTotals(year, month),
        getMonthIncome(year, month),
        getMonthExpenses(year, month),
        getMonthInvestments(year, month),
        getPeople(),
        getCategories(),
        getInvestmentDestinations(),
        getPlanSummary(),
      ]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const peopleOpts = people.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name }));
  const categoryOpts = categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));
  const destOpts = destinations.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section>
        <div style={{ marginBottom: "0.9rem", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
          <Link href="/" className="muted" style={{ textDecoration: "none" }}>الرئيسية</Link>
          <span className="muted">/</span>
          <Link href={`/year/${year}`} className="muted" style={{ textDecoration: "none" }}>
            سنة {year}
          </Link>
        </div>
        <h1 style={{ margin: "0 0 1rem", fontSize: "1.6rem" }}>
          {monthName(month)} {year}
        </h1>
        <HeroTotals totals={totals} />
      </section>

      <MonthSection
        type="income"
        title="الدخل"
        color="var(--income)"
        year={year}
        month={month}
        entries={income as unknown as AnyEntry[]}
        total={totals.income}
        addAction={addIncomeEntry}
        updateAction={updateIncomeEntry}
        deleteAction={deleteIncomeEntry}
        generateAction={generateRecurringIncome}
      />

      <MonthSection
        type="expense"
        title="المصروفات"
        color="var(--expense)"
        year={year}
        month={month}
        entries={expenses as unknown as AnyEntry[]}
        total={totals.expenses}
        people={peopleOpts}
        categories={categoryOpts}
        addAction={addExpenseEntry}
        updateAction={updateExpenseEntry}
        deleteAction={deleteExpenseEntry}
      />

      <MonthSection
        type="investment"
        title="الاستثمار"
        color="var(--invest)"
        year={year}
        month={month}
        entries={investments as unknown as AnyEntry[]}
        total={totals.investment}
        destinations={destOpts}
        addAction={addInvestmentEntry}
        updateAction={updateInvestmentEntry}
        deleteAction={deleteInvestmentEntry}
      />

      <PlanComparison plan={plan} actual={totals} />
    </div>
  );
}
