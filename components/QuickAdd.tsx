"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Wallet, Receipt, TrendingUp } from "lucide-react";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";
import { CURRENCIES } from "@/lib/constants";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";
type ServerAction = (fd: FormData) => Promise<void>;
type RadixColor = "green" | "red" | "blue";

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const TYPES: {
  key: EntryType;
  label: string;
  color: RadixColor;
  tint: string;
  Icon: typeof Wallet;
}[] = [
  { key: "income", label: "دخل", color: "green", tint: "var(--green-9)", Icon: Wallet },
  { key: "expense", label: "مصروف", color: "red", tint: "var(--red-9)", Icon: Receipt },
  { key: "investment", label: "استثمار", color: "blue", tint: "var(--blue-9)", Icon: TrendingUp },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="1" color="gray" mb="1" as="div">
      {children}
    </Text>
  );
}

function TypeIcon({ tint, Icon }: { tint: string; Icon: typeof Wallet }) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        background: `color-mix(in srgb, ${tint} 16%, transparent)`,
        color: tint,
      }}
    >
      <Icon size={14} strokeWidth={2.2} />
    </Flex>
  );
}

export default function QuickAdd({
  people,
  categories,
  destinations,
  addIncome,
  addExpense,
  addInvestment,
  generateIncome,
  generateExpense,
}: {
  people: Opt[];
  categories: Opt[];
  destinations: Opt[];
  addIncome: ServerAction;
  addExpense: ServerAction;
  addInvestment: ServerAction;
  generateIncome: ServerAction;
  generateExpense: ServerAction;
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
    return { year: base.slice(0, 4), month: String(parseInt(base.slice(5, 7), 10)), base };
  }

  async function onSubmit(fd: FormData) {
    const { year, month, base } = ym(date);
    fd.set("occurredOn", base);
    fd.set("year", year);
    fd.set("month", month);
    fd.set("currency", currency);
    fd.set("originalAmount", original);
    fd.set("rate", rate);
    if (type === "expense") {
      fd.set("categoryId", category === "none" ? "" : category);
      fd.set("personId", person === "none" ? "" : person);
    }
    if (type === "investment") {
      fd.set("destinationId", destination === "none" ? "" : destination);
    }
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

  async function onGenerate() {
    const { year, month } = ym(date);
    const fd = new FormData();
    fd.set("year", year);
    fd.set("month", month);
    setSaving(true);
    try {
      if (type === "income") {
        await generateIncome(fd);
        flash("تم توليد الدخل الثابت ✓");
      } else {
        await generateExpense(fd);
        flash("تم توليد المصروف الثابت ✓");
      }
    } finally {
      setSaving(false);
    }
  }

  function flash(msg: string) {
    setDone(msg);
    setTimeout(() => setDone(null), 2600);
  }

  return (
    <Card size="3">
      <form ref={formRef} action={onSubmit} lang="en">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" wrap="wrap" gap="2">
            <Heading size="4" lang="ar">إضافة سريعة</Heading>
            {done && (
              <Text size="2" weight="bold" color="green" lang="ar">
                {done}
              </Text>
            )}
          </Flex>

          <SegmentedControl.Root
            value={type}
            onValueChange={(v) => setType(v as EntryType)}
            size="3"
          >
            {TYPES.map((t) => (
              <SegmentedControl.Item key={t.key} value={t.key}>
                <Flex align="center" gap="2" lang="ar">
                  <TypeIcon tint={t.tint} Icon={t.Icon} />
                  {t.label}
                </Flex>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>

          {type !== "investment" && (
            <Box>
              <Button type="button" variant="soft" color={meta.color} onClick={onGenerate} disabled={saving}>
                ⟳ <span lang="ar">{type === "income" ? "توليد الدخل الثابت" : "توليد المصروف الثابت"}</span>
              </Button>
            </Box>
          )}

          <Grid columns={{ initial: "1", xs: "2", sm: "3" }} gap="3">
            <Box>
              <FieldLabel>التاريخ</FieldLabel>
              <TextField.Root
                type="date"
                lang="en"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
              <FieldLabel>{type === "income" ? "البند / المصدر" : "البند"}</FieldLabel>
              <TextField.Root type="text" name="label" />
            </Box>

            <Box>
              <FieldLabel>المبلغ الأصلي</FieldLabel>
              <TextField.Root
                type="number"
                lang="en"
                step="any"
                min="0"
                required
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
              />
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
                <TextField.Root
                  type="number"
                  lang="en"
                  step="any"
                  min="0"
                  placeholder="13.6"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </Box>
            )}

            <Box>
              <FieldLabel>المقابل بالجنيه</FieldLabel>
              <Flex align="center" height="32px">
                <Text weight="bold" color={meta.color} className="num">
                  {fmtEgp(egp)} EGP
                </Text>
              </Flex>
            </Box>

            <Box>
              <FieldLabel>ملاحظات</FieldLabel>
              <TextField.Root type="text" name="note" />
            </Box>
          </Grid>

          <Flex justify="end">
            <Button type="submit" color={meta.color} disabled={saving} size="3">
              <span lang="ar">{saving ? "جارٍ الحفظ..." : `+ إضافة ${meta.label}`}</span>
            </Button>
          </Flex>

          <Text size="1" color="gray" lang="ar">
            السنة والشهر بيتحددوا تلقائياً من التاريخ، والرقم بيتجمّع في بطاقة الشهر والسنة والإجمالي.
          </Text>
        </Flex>
      </form>
    </Card>
  );
}
