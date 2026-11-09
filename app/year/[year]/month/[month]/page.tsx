import Link from "next/link";
import {
  getCategories,
  getIncomeSources,
  getInvestmentDestinations,
  getMonthExpenses,
  getMonthIncome,
  getMonthInvestments,
  getMonthTotals,
  getPeople,
  getPlannedExpenses,
  getPlanSummary,
} from "@/lib/queries";
import { HeroTotals } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import MonthSection, { type AnyEntry } from "@/components/MonthSection";
import { type GItem } from "@/components/GenerateRecurring";
import { PlanComparison } from "@/components/PlanComparison";
import { monthName } from "@/lib/constants";
import { toNum } from "@/lib/format";
import {
  addExpenseEntry,
  addIncomeEntry,
  addInvestmentEntry,
  commitExpenseBatch,
  commitIncomeBatch,
  deleteExpenseEntry,
  deleteIncomeEntry,
  deleteInvestmentEntry,
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

  let totals, income, expenses, investments, people, categories, destinations, plan, sources, planned;
  try {
    [totals, income, expenses, investments, people, categories, destinations, plan, sources, planned] =
      await Promise.all([
        getMonthTotals(year, month),
        getMonthIncome(year, month),
        getMonthExpenses(year, month),
        getMonthInvestments(year, month),
        getPeople(),
        getCategories(),
        getInvestmentDestinations(),
        getPlanSummary(),
        getIncomeSources(),
        getPlannedExpenses(),
      ]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const peopleOpts = people.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name }));
  const categoryOpts = categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));
  const destOpts = destinations.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));

  const incomeItems: GItem[] = sources
    .filter((s) => s.active)
    .map((s) => ({
      key: "i" + s.id,
      label: s.name,
      currency: s.currency,
      original: String(toNum(s.defaultAmount)),
      rate: String(toNum(s.defaultRate) || 1),
      personId: null,
      categoryId: null,
      sourceId: s.id,
    }));
  const expenseItems: GItem[] = planned.map((p) => ({
    key: "e" + p.id,
    label: p.label,
    currency: "EGP",
    original: String(toNum(p.amountEgp)),
    rate: "1",
    personId: p.personId,
    categoryId: p.categoryId,
    sourceId: null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 flex gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link href={`/year/${year}`} className="hover:text-foreground">
            سنة {year}
          </Link>
        </div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight">
          {monthName(month)} <span className="tabular-nums">{year}</span>
        </h1>
        <HeroTotals totals={totals} />
      </section>

      <MonthSection
        type="income"
        title="الدخل"
        year={year}
        month={month}
        entries={income as unknown as AnyEntry[]}
        total={totals.income}
        addAction={addIncomeEntry}
        updateAction={updateIncomeEntry}
        deleteAction={deleteIncomeEntry}
        genItems={incomeItems}
        commitIncome={commitIncomeBatch}
      />

      <MonthSection
        type="expense"
        title="المصروفات"
        year={year}
        month={month}
        entries={expenses as unknown as AnyEntry[]}
        total={totals.expenses}
        people={peopleOpts}
        categories={categoryOpts}
        addAction={addExpenseEntry}
        updateAction={updateExpenseEntry}
        deleteAction={deleteExpenseEntry}
        genItems={expenseItems}
        commitExpense={commitExpenseBatch}
      />

      <MonthSection
        type="investment"
        title="الاستثمار"
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
