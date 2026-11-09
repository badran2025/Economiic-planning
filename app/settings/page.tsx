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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section>
        <Link href="/" className="muted" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
          ← الرئيسية
        </Link>
        <h1 style={{ margin: "0.3rem 0 0", fontSize: "1.6rem" }}>الإعدادات</h1>
      </section>

      {/* الإعدادات العامة + أسعار العملات */}
      <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
        <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.05rem" }}>عام وأسعار العملات الافتراضية</h3>
        <form
          action={updateSettings}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.7rem", alignItems: "end" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.78rem" }}>اسم الموقع</span>
            <input className="field" name="siteTitle" defaultValue={settings.siteTitle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.78rem" }}>سعر الريال السعودي (افتراضي)</span>
            <input className="field" type="text" inputMode="decimal" step="any" name="rateSar" defaultValue={String(settings.rateSar)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.78rem" }}>سعر الدولار (افتراضي)</span>
            <input className="field" type="text" inputMode="decimal" step="any" name="rateUsd" defaultValue={String(settings.rateUsd)} />
          </label>
          <button className="btn btn-primary" type="submit">حفظ</button>
        </form>
        <p className="muted" style={{ fontSize: "0.78rem", marginBottom: 0 }}>
          الأسعار دي للاسترشاد فقط — إنت بتدخل سعر التحويل مع كل عملية على حدة.
        </p>
      </section>

      {/* تحميل الافتراضيات */}
      <section className="card" style={{ padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
        <span className="muted" style={{ fontSize: "0.88rem" }}>
          تحب تبدأ بقوائم جاهزة (أشخاص/أنواع/مصادر دخل/وجهات استثمار)؟ هيتضاف بس للقوائم الفاضية.
        </span>
        <form action={loadDefaults}>
          <button className="btn" type="submit">تحميل التصنيفات الافتراضية</button>
        </form>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
        <SimpleList
          title="الأشخاص / المستفيدين"
          description="البيت، يارا، محمد، عبدالله... تُستخدم لتصنيف المصروفات."
          items={peopleOpts}
          addAction={addPerson}
          updateAction={updatePerson}
          deleteAction={deletePerson}
        />
        <SimpleList
          title="أنواع المصروفات"
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
