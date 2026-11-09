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

const TYPES: { key: EntryType; label: string; color: RadixColor }[] = [
  { key: "income", label: "دخل", color: "green" },
  { key: "expense", label: "مصروف", color: "red" },
  { key: "investment", label: "استثمار", color: "blue" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="1" color="gray" mb="1" as="div">
      {children}
    </Text>
  );
}

export default function QuickAdd({
  people,
  categories,
  destinations,
  addIncome,
  addExpense,
  addInvestment,
}: {
  people: Opt[];
  categories: Opt[];
  destinations: Opt[];
  addIncome: ServerAction;
  addExpense: ServerAction;
  addInvestment: ServerAction;
}) {
  const [type, setType] = useState<EntryType>("expense");
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

  async function onSubmit(fd: FormData) {
    const d = (fd.get("occurredOn") ?? "").toString() || todayISO();
    fd.set("occurredOn", d);
    fd.set("year", d.slice(0, 4));
    fd.set("month", String(parseInt(d.slice(5, 7), 10)));
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
      setDone(`تم إضافة ${names[type]} ✓`);
      setTimeout(() => setDone(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card size="3">
      <form ref={formRef} action={onSubmit}>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" wrap="wrap" gap="2">
            <Heading size="4">إضافة سريعة</Heading>
            {done && (
              <Text size="2" weight="bold" color="green">
                {done}
              </Text>
            )}
          </Flex>

          <SegmentedControl.Root
            value={type}
            onValueChange={(v) => setType(v as EntryType)}
            size="2"
          >
            {TYPES.map((t) => (
              <SegmentedControl.Item key={t.key} value={t.key}>
                {t.label}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>

          <Grid columns={{ initial: "1", xs: "2", sm: "3" }} gap="3">
            <Box>
              <FieldLabel>التاريخ</FieldLabel>
              <TextField.Root type="date" name="occurredOn" defaultValue={todayISO()} />
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
                  step="any"
                  min="0"
                  placeholder="مثال 13.6"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </Box>
            )}

            <Box>
              <FieldLabel>المقابل بالجنيه</FieldLabel>
              <Flex align="center" height="32px">
                <Text weight="bold" color={meta.color} className="num">
                  {fmtEgp(egp)} ج.م
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
              {saving ? "جارٍ الحفظ..." : `+ إضافة ${meta.label}`}
            </Button>
          </Flex>

          <Text size="1" color="gray">
            السنة والشهر بيتحددوا تلقائياً من التاريخ، والرقم بيتجمّع في بطاقة الشهر والسنة والإجمالي.
          </Text>
        </Flex>
      </form>
    </Card>
  );
}
