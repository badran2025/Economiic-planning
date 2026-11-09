import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
  const color = diff === 0 ? "text-muted-foreground" : good ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const sign = diff > 0 ? "+" : "";
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{fmtEgp(planned)}</TableCell>
      <TableCell className="font-bold tabular-nums">{fmtEgp(actual)}</TableCell>
      <TableCell className={cn("font-bold tabular-nums", color)}>{sign}{fmtEgp(diff)}</TableCell>
    </TableRow>
  );
}

export function PlanComparison({ plan, actual }: { plan: PlanSummary; actual: Totals }) {
  const hasPlan = plan.plannedIncome > 0 || plan.plannedExpenses > 0 || plan.plannedInvestment > 0;
  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="text-base font-bold">الخطة مقابل الفعلي</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          الخطة هي الهدف الشهري الثابت (من الإعدادات): الدخل من المصادر الثابتة، والمصروفات من بنود الخطة، والاستثمار من توزيع الفائض.
        </p>
      </div>
      {!hasPlan ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          لسه مفيش خطة. حدّدها من{" "}
          <a href="/settings" className="font-medium text-foreground underline">الإعدادات</a>.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">البند</TableHead>
                <TableHead className="text-right">المخطّط</TableHead>
                <TableHead className="text-right">الفعلي</TableHead>
                <TableHead className="text-right">الفرق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Row label="الدخل" planned={plan.plannedIncome} actual={actual.income} goodWhenHigher />
              <Row label="المصروفات" planned={plan.plannedExpenses} actual={actual.expenses} goodWhenHigher={false} />
              <Row label="الاستثمار" planned={plan.plannedInvestment} actual={actual.investment} goodWhenHigher />
              <Row label="المتبقّي" planned={plan.plannedIncome - plan.plannedExpenses - plan.plannedInvestment} actual={actual.net} goodWhenHigher />
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
