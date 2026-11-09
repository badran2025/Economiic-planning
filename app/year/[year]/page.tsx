import Link from "next/link";
import { getMonthlyTotals, getYearTotals } from "@/lib/queries";
import { HeroTotals, TotalsStrip } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { monthName } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-8">
      <section>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← الرئيسية</Link>
        <h1 className="mb-4 mt-1 text-2xl font-bold tracking-tight">
          سنة <span className="tabular-nums">{year}</span>
        </h1>
        <HeroTotals totals={yearTotals} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold tracking-tight">الشهور</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {months.map((m) => {
            const empty = m.income === 0 && m.expenses === 0 && m.investment === 0;
            return (
              <Link key={m.month} href={`/year/${year}/month/${m.month}`} className="block">
                <Card
                  className={cn(
                    "gap-3 p-4 transition-all hover:border-foreground/20 hover:shadow-md",
                    empty && "opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{monthName(m.month)}</span>
                    <Badge variant="secondary">{empty ? "فاضي" : "تفاصيل ←"}</Badge>
                  </div>
                  <TotalsStrip totals={m} />
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
