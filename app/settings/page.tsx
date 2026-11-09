import Link from "next/link";
import {
  getCategories,
  getInvestmentDestinations,
  getInvestmentProgress,
  getPeople,
  getIncomeSources,
  getPlannedExpenses,
  getSettings,
} from "@/lib/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SimpleList from "@/components/SimpleList";
import IncomeSourcesEditor from "@/components/IncomeSourcesEditor";
import InvestmentDestinationsEditor from "@/components/InvestmentDestinationsEditor";
import PlannedExpensesEditor from "@/components/PlannedExpensesEditor";
import {
  addCategory,
  addIncomeSource,
  addInvestmentDestination,
  addPerson,
  addPlannedExpense,
  deleteCategory,
  deleteIncomeSource,
  deleteInvestmentDestination,
  deletePerson,
  deletePlannedExpense,
  loadDefaults,
  updateCategory,
  updateIncomeSource,
  updateInvestmentDestination,
  updatePerson,
  updatePlannedExpense,
  updateSettings,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings, people, categories, sources, planned, dests, progress;
  try {
    [settings, people, categories, sources, planned, dests, progress] = await Promise.all([
      getSettings(),
      getPeople(),
      getCategories(),
      getIncomeSources(),
      getPlannedExpenses(),
      getInvestmentDestinations(),
      getInvestmentProgress(),
    ]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const peopleOpts = people.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name }));
  const categoryOpts = categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← الرئيسية</Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">الإعدادات</h1>
      </section>

      {/* الإعدادات العامة + أسعار العملات */}
      <Card className="gap-3 p-5">
        <h3 className="text-base font-bold">عام وأسعار العملات الافتراضية</h3>
        <form action={updateSettings} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">اسم الموقع</Label>
            <Input name="siteTitle" defaultValue={settings.siteTitle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">سعر الريال السعودي (افتراضي)</Label>
            <Input type="text" inputMode="decimal" name="rateSar" defaultValue={String(settings.rateSar)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">سعر الدولار (افتراضي)</Label>
            <Input type="text" inputMode="decimal" name="rateUsd" defaultValue={String(settings.rateUsd)} />
          </div>
          <Button type="submit">حفظ</Button>
        </form>
        <p className="text-xs text-muted-foreground">
          الأسعار دي للاسترشاد فقط — إنت بتدخل سعر التحويل مع كل عملية على حدة.
        </p>
      </Card>

      {/* تحميل الافتراضيات */}
      <Card className="flex-row flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-muted-foreground">
          تحب تبدأ بقوائم جاهزة (مستفيدين/مراكز تكلفة/مصادر دخل/وجهات استثمار)؟ هيتضاف بس للقوائم الفاضية.
        </span>
        <form action={loadDefaults}>
          <Button type="submit" variant="secondary">تحميل التصنيفات الافتراضية</Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SimpleList
          title="المستفيدون"
          description="البيت، يارا، محمد، عبدالله... تُستخدم لتصنيف المصروفات."
          items={peopleOpts}
          addAction={addPerson}
          updateAction={updatePerson}
          deleteAction={deletePerson}
        />
        <SimpleList
          title="مراكز التكلفة"
          description="فواتير، دروس، كلية، علاج... (مراكز التكلفة)."
          items={categoryOpts}
          addAction={addCategory}
          updateAction={updateCategory}
          deleteAction={deleteCategory}
        />
      </div>

      <IncomeSourcesEditor
        items={sources.map((s) => ({
          id: s.id,
          name: s.name,
          currency: s.currency,
          defaultAmount: s.defaultAmount,
          defaultRate: s.defaultRate,
        }))}
        addAction={addIncomeSource}
        updateAction={updateIncomeSource}
        deleteAction={deleteIncomeSource}
      />

      <PlannedExpensesEditor
        items={planned.map((p) => ({
          id: p.id,
          label: p.label,
          personId: p.personId,
          categoryId: p.categoryId,
          amountEgp: p.amountEgp,
        }))}
        people={peopleOpts}
        categories={categoryOpts}
        addAction={addPlannedExpense}
        updateAction={updatePlannedExpense}
        deleteAction={deletePlannedExpense}
      />

      <InvestmentDestinationsEditor
        items={dests.map((d) => ({
          id: d.id,
          name: d.name,
          percentage: d.percentage,
          targetAmount: d.targetAmount,
        }))}
        progress={progress.map((p) => ({ id: p.id, actual: p.actual, target: p.target }))}
        addAction={addInvestmentDestination}
        updateAction={updateInvestmentDestination}
        deleteAction={deleteInvestmentDestination}
      />
    </div>
  );
}
