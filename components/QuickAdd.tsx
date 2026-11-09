"use client";

import { useRef, useState } from "react";
import { Box, Button, Card, Flex, Grid, Heading, Select, Separator, Text, TextField } from "@radix-ui/themes";
import DatePicker from "@/components/DatePicker";
import GenerateRecurring, { type GItem } from "@/components/GenerateRecurring";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";
import { CURRENCIES } from "@/lib/constants";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";
type ServerAction = (fd: FormData) => Promise<void>;
type RadixColor = "green" | "red" | "blue";

type IncomeSource = { id: number; name: string; currency: string; defaultAmount: string | number; defaultRate: string | number };
type PlannedExpense = { id: number; label: string; personId: number | null; categoryId: number | null; amountEgp: string | number };

type IncomeBatch = (p: {
  year: number; month: number; occurredOn: string | null;
  items: { sourceId: number | null; label: string; currency: string; originalAmount: number; rate: number }[];
}) => Promise<void>;
type ExpenseBatch = (p: {
  year: number; month: number; occurredOn: string | null;
  items: { label: string; personId: number | null; categoryId: number | null; amountEgp: number }[];
}) => Promise<void>;

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const TYPES: { key: EntryType; label: string; color: RadixColor }[] = [
  { key: "income", label: "دخل", color: "green" },
  { key: "expense", label: "مصروف", color: "red" },
  { key: "investment", label: "استثمار", color: "blue" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text size="1" color="gray" mb="1" as="div">{children}</Text>;
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
  const [date, setDate] = useState(todayISO());
  const [currency, setCurrency] = useState("EGP");
  const [original, setOriginal] = useState("");
  const [rate, setRate] = useState("");
  const [category, setCategory] = useState("none");
  const [person, setPerson] = useState("none");
  const [destination, setDestination] = useState("none");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEgp = currency === "EGP";
  const egp = computeEgp(toNum(original), isEgp ? 1 : toNum(rate) || 0);
  const meta = TYPES.find((t) => t.key === type)!;

  function ym(d: string) {
    const base = d || todayISO();
    return { year: parseInt(base.slice(0, 4), 10), month: parseInt(base.slice(5, 7), 10), base };
  }
  function flash(msg: string) {
    setDone(msg);
    setTimeout(() => setDone(null), 2600);
  }

  async function onSubmit(fd: FormData) {
    const { year, month, base } = ym(date);
    fd.set("occurredOn", base);
    fd.set("year", String(year));
    fd.set("month", String(month));
    fd.set("currency", currency);
    fd.set("originalAmount", original);
    fd.set("rate", rate);
    if (type === "expense") {
      fd.set("categoryId", category === "none" ? "" : category);
      fd.set("personId", person === "none" ? "" : person);
    }
    if (type === "investment") fd.set("destinationId", destination === "none" ? "" : destination);
    setSaving(true);
    try {
      if (type === "income") await addIncome(fd);
      else if (type === "expense") await addExpense(fd);
      else await addInvestment(fd);
      formRef.current?.reset();
      setOriginal("");
      setRate("");
      setCurrency("EGP");
      setCategory("none");
      setPerson("none");
      setDestination("none");
      const names: Record<EntryType, string> = { income: "الدخل", expense: "المصروف", investment: "الاستثمار" };
      flash(`تم إضافة ${names[type]} ✓`);
    } finally {
      setSaving(false);
    }
  }

  const incomeItems: GItem[] = incomeSources.map((s) => ({
    key: "i" + s.id,
    label: s.name,
    currency: s.currency,
    original: String(toNum(s.defaultAmount)),
    rate: String(toNum(s.defaultRate) || 1),
    personId: null,
    categoryId: null,
    sourceId: s.id,
  }));
  const expenseItems: GItem[] = plannedExpenses.map((p) => ({
    key: "e" + p.id,
    label: p.label,
    currency: "EGP",
    original: String(toNum(p.amountEgp)),
    rate: "1",
    personId: p.personId,
    categoryId: p.categoryId,
    sourceId: null,
  }));

  async function confirmIncome(rows: GItem[]) {
    const { year, month, base } = ym(date);
    await commitIncome({
      year,
      month,
      occurredOn: base,
      items: rows.map((r) => ({
        sourceId: r.sourceId,
        label: r.label,
        currency: r.currency,
        originalAmount: toNum(r.original),
        rate: toNum(r.rate) || 1,
      })),
    });
    flash("تم إضافة الدخل المختار ✓");
  }
  async function confirmExpense(rows: GItem[]) {
    const { year, month, base } = ym(date);
    await commitExpense({
      year,
      month,
      occurredOn: base,
      items: rows.map((r) => ({
        label: r.label,
        personId: r.personId,
        categoryId: r.categoryId,
        amountEgp: toNum(r.original),
      })),
    });
    flash("تم إضافة المصروف المختار ✓");
  }

  return (
    <Card size="3">
      <form ref={formRef} action={onSubmit}>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" wrap="wrap" gap="2">
            <Heading size="4">إضافة سريعة</Heading>
            {done && <Text size="2" weight="bold" color="green">{done}</Text>}
          </Flex>

          {/* اختيار النوع — خلفية شفافة ملوّنة */}
          <Flex gap="2" wrap="wrap">
            {TYPES.map((t) => {
              const active = type === t.key;
              return (
                <Button
                  key={t.key}
                  type="button"
                  variant="soft"
                  color={t.color}
                  size="3"
                  onClick={() => setType(t.key)}
                  style={{
                    flex: "1 1 120px",
                    opacity: active ? 1 : 0.55,
                    boxShadow: active ? `inset 0 0 0 1px var(--${t.color}-8)` : undefined,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {t.label}
                </Button>
              );
            })}
          </Flex>

          {type === "income" && (
            <Box>
              <GenerateRecurring
                triggerLabel="توليد الدخل الثابت"
                title="اختر بنود الدخل الثابت"
                color="green"
                items={incomeItems}
                emptyText="مفيش مصادر دخل ثابتة محفوظة. ضيفها من الإعدادات."
                onConfirm={confirmIncome}
              />
            </Box>
          )}
          {type === "expense" && (
            <Box>
              <GenerateRecurring
                triggerLabel="توليد المصروف الثابت"
                title="اختر بنود المصروف الثابت"
                color="red"
                items={expenseItems}
                emptyText="مفيش بنود مصروفات مخطّطة محفوظة. ضيفها من الإعدادات."
                onConfirm={confirmExpense}
              />
            </Box>
          )}

          <Text size="1" color="gray">
            {type === "investment"
              ? "املأ الحقول لإضافة بند استثمار جديد."
              : `استخدم زر «${type === "income" ? "توليد الدخل الثابت" : "توليد المصروف الثابت"}» لاختيار بنود محفوظة من الإعدادات، أو املأ الحقول تحت لإضافة بند جديد يدوي.`}
          </Text>

          <Grid columns={{ initial: "1", xs: "2", sm: "3" }} gap="3">
            <Box>
              <FieldLabel>التاريخ</FieldLabel>
              <DatePicker value={date} onChange={setDate} />
            </Box>

            {type === "expense" && (
              <>
                <Box>
                  <FieldLabel>النوع</FieldLabel>
                  <Select.Root value={category} onValueChange={setCategory}>
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      <Select.Item value="none">— بدون —</Select.Item>
                      {categories.map((o) => (
                        <Select.Item key={o.id} value={String(o.id)}>{o.name}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <FieldLabel>الشخص</FieldLabel>
                  <Select.Root value={person} onValueChange={setPerson}>
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      <Select.Item value="none">— بدون —</Select.Item>
                      {people.map((o) => (
                        <Select.Item key={o.id} value={String(o.id)}>{o.name}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </>
            )}

            {type === "investment" && (
              <Box>
                <FieldLabel>الوجهة</FieldLabel>
                <Select.Root value={destination} onValueChange={setDestination}>
                  <Select.Trigger style={{ width: "100%" }} />
                  <Select.Content>
                    <Select.Item value="none">— بدون —</Select.Item>
                    {destinations.map((o) => (
                      <Select.Item key={o.id} value={String(o.id)}>{o.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            )}

            <Box>
              <FieldLabel>{type === "income" ? "اسم الدخل / المصدر" : "الوصف / البيان"}</FieldLabel>
              <TextField.Root type="text" name="label" placeholder={type === "income" ? "مثلاً: مكافأة" : "وصف مختصر (اختياري)"} />
            </Box>

            <Box>
              <FieldLabel>المبلغ الأصلي</FieldLabel>
              <TextField.Root type="text" inputMode="decimal" required value={original} onChange={(e) => setOriginal(e.target.value)} />
            </Box>

            <Box>
              <FieldLabel>العملة</FieldLabel>
              <Select.Root value={currency} onValueChange={setCurrency}>
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  {CURRENCIES.map((c) => (
                    <Select.Item key={c.code} value={c.code}>{c.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {!isEgp && (
              <Box>
                <FieldLabel>سعر التحويل للجنيه</FieldLabel>
                <TextField.Root type="text" inputMode="decimal" placeholder="13.6" value={rate} onChange={(e) => setRate(e.target.value)} />
              </Box>
            )}

            <Box>
              <FieldLabel>المقابل بالجنيه</FieldLabel>
              <Flex align="center" height="32px">
                <Text weight="bold" color={meta.color} className="num">{fmtEgp(egp)} EGP</Text>
              </Flex>
            </Box>

          </Grid>

          <Flex justify="end">
            <Button type="submit" color={meta.color} disabled={saving} size="3">
              {saving ? "جارٍ الحفظ..." : `+ إضافة ${meta.label}`}
            </Button>
          </Flex>

          <Separator size="4" />
          <Text size="1" color="gray">
            السنة والشهر بيتحددوا تلقائياً من التاريخ، والرقم بيتجمّع في بطاقة الشهر والسنة والإجمالي.
          </Text>
        </Flex>
      </form>
    </Card>
  );
}
