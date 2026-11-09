import Link from "next/link";
import {
  getCategories,
  getGrandTotals,
  getIncomeSources,
  getInvestmentDestinations,
  getPeople,
  getPlannedExpenses,
  getYearsWithTotals,
} from "@/lib/queries";
import { HeroTotals, TotalsStrip } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import QuickAdd from "@/components/QuickAdd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addExpenseEntry,
  addIncomeEntry,
  addInvestmentEntry,
  addYear,
  commitExpenseBatch,
  commitIncomeBatch,
  loadDefaults,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let totals, years, people, categories, destinations, sources, planned;
  try {
    [totals, years, people, categories, destinations, sources, planned] = await Promise.all([
      getGrandTotals(),
      getYearsWithTotals(),
      getPeople(),
      getCategories(),
      getInvestmentDestinations(),
      getIncomeSources(),
      getPlannedExpenses(),
    ]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const peopleOpts = people.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name }));
  const categoryOpts = categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));
  const destOpts = destinations.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));
  const sourceList = sources.filter((s) => s.active).map((s) => ({
    id: s.id, name: s.name, currency: s.currency, defaultAmount: s.defaultAmount, defaultRate: s.defaultRate,
  }));
  const plannedList = planned.map((p) => ({
    id: p.id, label: p.label, personId: p.personId, categoryId: p.categoryId, amountEgp: p.amountEgp,
  }));
  const nextYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">الملخّص الإجمالي</h1>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          كل الأرقام بالجنيه المصري، ومجمّعة تلقائياً من كل الشهور والسنين.
        </p>
        <HeroTotals totals={totals} />
      </section>

      <QuickAdd
        people={peopleOpts}
        categories={categoryOpts}
        destinations={destOpts}
        incomeSources={sourceList}
        plannedExpenses={plannedList}
        addIncome={addIncomeEntry}
        addExpense={addExpenseEntry}
        addInvestment={addInvestmentEntry}
        commitIncome={commitIncomeBatch}
        commitExpense={commitExpenseBatch}
      />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">السنوات</h2>
          <form action={addYear} className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              name="year"
              defaultValue={nextYear}
              aria-label="السنة"
              className="w-28"
            />
            <Button type="submit">+ إضافة سنة</Button>
          </form>
        </div>

        {years.length === 0 ? (
          <Card className="items-center gap-3 p-8 text-center">
            <p className="text-muted-foreground">مفيش سنين لسه. أضف سنة من فوق عشان تبدأ.</p>
            <form action={loadDefaults}>
              <Button type="submit" variant="secondary">تحميل التصنيفات الافتراضية</Button>
            </form>
            <p className="text-xs text-muted-foreground">
              اختياري — تقدر تعدّلها أو تحذفها بعدين من الإعدادات.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {years.map((y) => (
              <Link key={y.year} href={`/year/${y.year}`} className="block">
                <Card className="gap-3 p-5 transition-all hover:border-foreground/20 hover:shadow-md">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold tabular-nums">{y.year}</span>
                    <span className="text-xs text-muted-foreground">عرض الشهور ←</span>
                  </div>
                  <TotalsStrip totals={y} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
