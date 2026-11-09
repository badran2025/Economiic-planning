"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import MonthYearPicker, { currentYM } from "@/components/MonthYearPicker";
import GenerateRecurring, { type GItem } from "@/components/GenerateRecurring";
import { cn } from "@/lib/utils";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";
import { CURRENCIES } from "@/lib/constants";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";
type ServerAction = (fd: FormData) => Promise<void>;

type IncomeSource = { id: number; name: string; currency: string; defaultAmount: string | number; defaultRate: string | number };
type PlannedExpense = { id: number; label: string; personId: number | null; categoryId: number | null; amountEgp: string | number };
type IncomeBatch = (p: { year: number; month: number; occurredOn: string | null; items: { sourceId: number | null; label: string; currency: string; originalAmount: number; rate: number }[] }) => Promise<void>;
type ExpenseBatch = (p: { year: number; month: number; occurredOn: string | null; items: { label: string; personId: number | null; categoryId: number | null; amountEgp: number }[] }) => Promise<void>;

const TYPES: {
  key: EntryType;
  label: string;
  base: string;
  active: string;
  submit: string;
  text: string;
}[] = [
  {
    key: "income",
    label: "دخل",
    base: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
    active: "bg-emerald-500/20 ring-2 ring-emerald-500/50",
    submit: "bg-emerald-600 text-white hover:bg-emerald-600/90",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "expense",
    label: "مصروف",
    base: "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20",
    active: "bg-rose-500/20 ring-2 ring-rose-500/50",
    submit: "bg-rose-600 text-white hover:bg-rose-600/90",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "investment",
    label: "استثمار",
    base: "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20",
    active: "bg-blue-500/20 ring-2 ring-blue-500/50",
    submit: "bg-blue-600 text-white hover:bg-blue-600/90",
    text: "text-blue-600 dark:text-blue-400",
  },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function QuickAdd({
  people,
  categories,
  destinations,
  incomeSources,
  plannedExpenses,
  addIncome,
  addExpense,
  addInvestment,
  commitIncome,
  commitExpense,
}: {
  people: Opt[];
  categories: Opt[];
  destinations: Opt[];
  incomeSources: IncomeSource[];
  plannedExpenses: PlannedExpense[];
  addIncome: ServerAction;
  addExpense: ServerAction;
  addInvestment: ServerAction;
  commitIncome: IncomeBatch;
  commitExpense: ExpenseBatch;
}) {
  const [type, setType] = useState<EntryType>("expense");
  const [period, setPeriod] = useState(currentYM());
  const [currency, setCurrency] = useState("EGP");
  const [original, setOriginal] = useState("");
  const [rate, setRate] = useState("");
  const [category, setCategory] = useState("");
  const [person, setPerson] = useState("");
  const [destination, setDestination] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEgp = currency === "EGP";
  const egp = computeEgp(toNum(original), isEgp ? 1 : toNum(rate) || 0);
  const meta = TYPES.find((t) => t.key === type)!;

  function ym(p: string) {
    return { year: parseInt(p.slice(0, 4), 10), month: parseInt(p.slice(5, 7), 10), base: p + "-01" };
  }
  function flash(msg: string) {
    setDone(msg);
    setTimeout(() => setDone(null), 2600);
  }

  async function onSubmit(fd: FormData) {
    const { year, month, base } = ym(period);
    fd.set("occurredOn", base);
    fd.set("year", String(year));
    fd.set("month", String(month));
    fd.set("currency", currency);
    fd.set("originalAmount", original);
    fd.set("rate", rate);
    if (type === "expense") {
      fd.set("categoryId", category);
      fd.set("personId", person);
    }
    if (type === "investment") fd.set("destinationId", destination);
    setSaving(true);
    try {
      if (type === "income") await addIncome(fd);
      else if (type === "expense") await addExpense(fd);
      else await addInvestment(fd);
      formRef.current?.reset();
      setOriginal("");
      setRate("");
      setCurrency("EGP");
      setCategory("");
      setPerson("");
      setDestination("");
      const names: Record<EntryType, string> = { income: "الدخل", expense: "المصروف", investment: "الاستثمار" };
      flash(`تم إضافة ${names[type]} ✓`);
    } finally {
      setSaving(false);
    }
  }

  const incomeItems: GItem[] = incomeSources.map((s) => ({
    key: "i" + s.id, label: s.name, currency: s.currency,
    original: String(toNum(s.defaultAmount)), rate: String(toNum(s.defaultRate) || 1),
    personId: null, categoryId: null, sourceId: s.id,
  }));
  const expenseItems: GItem[] = plannedExpenses.map((p) => ({
    key: "e" + p.id, label: p.label, currency: "EGP",
    original: String(toNum(p.amountEgp)), rate: "1",
    personId: p.personId, categoryId: p.categoryId, sourceId: null,
  }));

  async function confirmIncome(rows: GItem[]) {
    const { year, month, base } = ym(period);
    await commitIncome({
      year, month, occurredOn: base,
      items: rows.map((r) => ({ sourceId: r.sourceId, label: r.label, currency: r.currency, originalAmount: toNum(r.original), rate: toNum(r.rate) || 1 })),
    });
    flash("تم إضافة الدخل المختار ✓");
  }
  async function confirmExpense(rows: GItem[]) {
    const { year, month, base } = ym(period);
    await commitExpense({
      year, month, occurredOn: base,
      items: rows.map((r) => ({ label: r.label, personId: r.personId, categoryId: r.categoryId, amountEgp: toNum(r.original) })),
    });
    flash("تم إضافة المصروف المختار ✓");
  }

  return (
    <Card className="gap-4 p-5">
      <form ref={formRef} action={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight">إضافة سريعة</h2>
          {done && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{done}</span>}
        </div>

        {/* اختيار النوع — خلفية شفافة ملوّنة */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={cn(
                "flex-1 basis-28 rounded-md px-3 py-2.5 text-sm font-semibold transition",
                t.base,
                type === t.key && t.active
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type === "income" && (
          <GenerateRecurring triggerLabel="توليد الدخل الثابت" title="اختر بنود الدخل الثابت" tone="income" items={incomeItems} emptyText="مفيش مصادر دخل ثابتة محفوظة. ضيفها من الإعدادات." onConfirm={confirmIncome} />
        )}
        {type === "expense" && (
          <GenerateRecurring triggerLabel="توليد المصروف الثابت" title="اختر بنود المصروف الثابت" tone="expense" items={expenseItems} emptyText="مفيش بنود مصروفات مخطّطة محفوظة. ضيفها من الإعدادات." onConfirm={confirmExpense} />
        )}

        <p className="text-xs text-muted-foreground">
          {type === "investment"
            ? "املأ الحقول لإضافة بند استثمار جديد."
            : `استخدم زر «${type === "income" ? "توليد الدخل الثابت" : "توليد المصروف الثابت"}» لاختيار بنود محفوظة، أو املأ الحقول لإضافة بند جديد.`}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="الشهر والسنة">
            <MonthYearPicker value={period} onChange={setPeriod} />
          </Field>

          {type === "expense" && (
            <>
              <Field label="مراكز التكلفة">
                <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                  <NativeSelectOption value="">— بدون —</NativeSelectOption>
                  {categories.map((o) => (
                    <NativeSelectOption key={o.id} value={String(o.id)}>{o.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="المستفيد">
                <NativeSelect value={person} onChange={(e) => setPerson(e.target.value)}>
                  <NativeSelectOption value="">— بدون —</NativeSelectOption>
                  {people.map((o) => (
                    <NativeSelectOption key={o.id} value={String(o.id)}>{o.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </>
          )}

          {type === "investment" && (
            <Field label="الوجهة">
              <NativeSelect value={destination} onChange={(e) => setDestination(e.target.value)}>
                <NativeSelectOption value="">— بدون —</NativeSelectOption>
                {destinations.map((o) => (
                  <NativeSelectOption key={o.id} value={String(o.id)}>{o.name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}

          <Field label={type === "income" ? "اسم الدخل / المصدر" : "الوصف / البيان"}>
            <Input type="text" name="label" placeholder={type === "income" ? "مثلاً: مكافأة" : "وصف مختصر (اختياري)"} />
          </Field>

          <Field label="المبلغ الأصلي">
            <Input type="text" inputMode="decimal" required value={original} onChange={(e) => setOriginal(e.target.value)} />
          </Field>

          <Field label="العملة">
            <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <NativeSelectOption key={c.code} value={c.code}>{c.label}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {!isEgp && (
            <Field label="سعر التحويل للجنيه">
              <Input type="text" inputMode="decimal" placeholder="13.6" value={rate} onChange={(e) => setRate(e.target.value)} />
            </Field>
          )}

          <Field label="المقابل بالجنيه">
            <div className={cn("flex h-9 items-center text-base font-bold tabular-nums", meta.text)}>
              {fmtEgp(egp)} EGP
            </div>
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className={cn(meta.submit)}>
            {saving ? "جارٍ الحفظ..." : `+ إضافة ${meta.label}`}
          </Button>
        </div>

        <Separator />
        <p className="text-xs text-muted-foreground">
          السنة والشهر بيتحددوا تلقائياً من التاريخ، والرقم بيتجمّع في بطاقة الشهر والسنة والإجمالي.
        </p>
      </form>
    </Card>
  );
}
