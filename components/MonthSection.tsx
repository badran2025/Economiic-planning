"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import GenerateRecurring, { type GItem } from "@/components/GenerateRecurring";
import { cn } from "@/lib/utils";
import { CURRENCIES, currencySymbol } from "@/lib/constants";
import { computeEgp, fmtEgp, fmtNumber, toNum } from "@/lib/format";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";

const TONE: Record<EntryType, { dot: string; text: string }> = {
  income: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  expense: { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  investment: { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
};

export type AnyEntry = {
  id: number;
  label: string | null;
  currency: string;
  originalAmount: string | number;
  rate: string | number;
  amountEgp: string | number;
  occurredOn: string | null;
  note: string | null;
  categoryId?: number | null;
  personId?: number | null;
  destinationId?: number | null;
  categoryName?: string | null;
  personName?: string | null;
  destinationName?: string | null;
};

type ServerAction = (fd: FormData) => Promise<void>;
type IncomeBatch = (p: { year: number; month: number; occurredOn: string | null; items: { sourceId: number | null; label: string; currency: string; originalAmount: number; rate: number }[] }) => Promise<void>;
type ExpenseBatch = (p: { year: number; month: number; occurredOn: string | null; items: { label: string; personId: number | null; categoryId: number | null; amountEgp: number }[] }) => Promise<void>;

type Props = {
  type: EntryType;
  title: string;
  year: number;
  month: number;
  entries: AnyEntry[];
  total: number;
  people?: Opt[];
  categories?: Opt[];
  destinations?: Opt[];
  addAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
  genItems?: GItem[];
  commitIncome?: IncomeBatch;
  commitExpense?: ExpenseBatch;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CurrencyInputs({
  defaultCurrency = "EGP",
  defaultOriginal = "",
  defaultRate = "",
}: {
  defaultCurrency?: string;
  defaultOriginal?: string | number;
  defaultRate?: string | number;
}) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [original, setOriginal] = useState(String(defaultOriginal ?? ""));
  const [rate, setRate] = useState(String(defaultRate ?? ""));
  const isEgp = currency === "EGP";
  const egp = computeEgp(toNum(original), isEgp ? 1 : toNum(rate) || 0);
  return (
    <>
      <Field label="المبلغ الأصلي">
        <Input type="text" inputMode="decimal" name="originalAmount" required value={original} onChange={(e) => setOriginal(e.target.value)} />
      </Field>
      <Field label="العملة">
        <NativeSelect name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <NativeSelectOption key={c.code} value={c.code}>{c.label}</NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      {!isEgp && (
        <Field label="سعر التحويل للجنيه">
          <Input type="text" inputMode="decimal" name="rate" placeholder="13.6" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
      )}
      <Field label="المقابل بالجنيه">
        <div className="flex h-9 items-center text-sm font-bold tabular-nums">{fmtEgp(egp)} EGP</div>
      </Field>
    </>
  );
}

function ClassifierInputs({
  type,
  people,
  categories,
  destinations,
  entry,
}: {
  type: EntryType;
  people?: Opt[];
  categories?: Opt[];
  destinations?: Opt[];
  entry?: AnyEntry;
}) {
  return (
    <>
      {type === "expense" && (
        <>
          <Field label="مراكز التكلفة">
            <NativeSelect name="categoryId" defaultValue={entry?.categoryId ?? ""}>
              <NativeSelectOption value="">— بدون —</NativeSelectOption>
              {(categories ?? []).map((o) => (
                <NativeSelectOption key={o.id} value={o.id}>{o.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="المستفيد">
            <NativeSelect name="personId" defaultValue={entry?.personId ?? ""}>
              <NativeSelectOption value="">— بدون —</NativeSelectOption>
              {(people ?? []).map((o) => (
                <NativeSelectOption key={o.id} value={o.id}>{o.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </>
      )}
      {type === "investment" && (
        <Field label="الوجهة">
          <NativeSelect name="destinationId" defaultValue={entry?.destinationId ?? ""}>
            <NativeSelectOption value="">— بدون —</NativeSelectOption>
            {(destinations ?? []).map((o) => (
              <NativeSelectOption key={o.id} value={o.id}>{o.name}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field label={type === "income" ? "اسم الدخل / المصدر" : "الوصف / البيان"}>
        <Input type="text" name="label" defaultValue={entry?.label ?? ""} placeholder={type === "income" ? "مثلاً: مكافأة" : "وصف مختصر (اختياري)"} />
      </Field>
    </>
  );
}

export default function MonthSection({
  type,
  title,
  year,
  month,
  entries,
  total,
  people,
  categories,
  destinations,
  addAction,
  updateAction,
  deleteAction,
  genItems,
  commitIncome,
  commitExpense,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const addFormRef = useRef<HTMLFormElement>(null);
  const tone = TONE[type];

  const classifierCols = type === "expense" ? 2 : type === "investment" ? 1 : 0;
  const colCount = 5 + classifierCols + 1;

  async function confirmGenerate(rows: GItem[]) {
    if (type === "income" && commitIncome) {
      await commitIncome({
        year, month, occurredOn: null,
        items: rows.map((r) => ({ sourceId: r.sourceId, label: r.label, currency: r.currency, originalAmount: toNum(r.original), rate: toNum(r.rate) || 1 })),
      });
    } else if (type === "expense" && commitExpense) {
      await commitExpense({
        year, month, occurredOn: null,
        items: rows.map((r) => ({ label: r.label, personId: r.personId, categoryId: r.categoryId, amountEgp: toNum(r.original) })),
      });
    }
  }

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <span className={cn("size-2.5 rounded-full", tone.dot)} />
          {title}
          <span className={cn("font-extrabold tabular-nums", tone.text)}>{fmtEgp(total)} EGP</span>
        </h3>
        <div className="flex gap-2">
          {genItems && (type === "income" || type === "expense") && (
            <GenerateRecurring
              triggerLabel={type === "expense" ? "توليد المصروف الثابت" : "توليد الدخل الثابت"}
              title={type === "expense" ? "اختر بنود المصروف الثابت" : "اختر بنود الدخل الثابت"}
              tone={type === "expense" ? "expense" : "income"}
              items={genItems}
              emptyText={type === "expense" ? "مفيش بنود مصروفات مخطّطة محفوظة. ضيفها من الإعدادات." : "مفيش مصادر دخل ثابتة محفوظة. ضيفها من الإعدادات."}
              onConfirm={confirmGenerate}
            />
          )}
          <Button type="button" size="sm" variant={showAdd ? "secondary" : "default"} onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? <X className="size-4" /> : <Plus className="size-4" />}
            {showAdd ? "إغلاق" : "إضافة"}
          </Button>
        </div>
      </div>

      {showAdd && (
        <form
          ref={addFormRef}
          action={async (fd) => {
            await addAction(fd);
            addFormRef.current?.reset();
            setShowAdd(false);
          }}
          className="grid grid-cols-1 gap-3 rounded-lg border border-dashed bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <p className="col-span-full m-0 text-xs text-muted-foreground">
            {type === "income"
              ? "إضافة بند دخل جديد يدوي. للبنود الثابتة استخدم «توليد الدخل الثابت»."
              : type === "expense"
              ? "إضافة بند مصروف جديد يدوي. للبنود الثابتة استخدم «توليد المصروف الثابت»."
              : "إضافة بند استثمار جديد."}
          </p>
          <ClassifierInputs type={type} people={people} categories={categories} destinations={destinations} />
          <CurrencyInputs />
          <div className="flex items-end">
            <Button type="submit" className="w-full">حفظ</Button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">مفيش بنود في الشهر ده.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {type === "expense" && <TableHead className="text-right">مراكز التكلفة</TableHead>}
                {type === "expense" && <TableHead className="text-right">المستفيد</TableHead>}
                {type === "investment" && <TableHead className="text-right">الوجهة</TableHead>}
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الأصلي</TableHead>
                <TableHead className="text-right">العملة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">EGP</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => {
                if (editingId === e.id) {
                  return (
                    <TableRow key={e.id}>
                      <TableCell colSpan={colCount} className="p-0">
                        <form
                          action={async (fd) => {
                            await updateAction(fd);
                            setEditingId(null);
                          }}
                          className="grid grid-cols-1 gap-3 bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="year" value={year} />
                          <input type="hidden" name="month" value={month} />
                          <ClassifierInputs type={type} people={people} categories={categories} destinations={destinations} entry={e} />
                          <CurrencyInputs defaultCurrency={e.currency} defaultOriginal={e.originalAmount} defaultRate={e.rate} />
                          <div className="flex items-end gap-2">
                            <Button type="submit">حفظ</Button>
                            <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>إلغاء</Button>
                          </div>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={e.id}>
                    {type === "expense" && <TableCell>{e.categoryName ?? "—"}</TableCell>}
                    {type === "expense" && <TableCell>{e.personName ?? "—"}</TableCell>}
                    {type === "investment" && <TableCell>{e.destinationName ?? "—"}</TableCell>}
                    <TableCell>{e.label || "—"}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(e.originalAmount)}</TableCell>
                    <TableCell><Badge variant="secondary">{currencySymbol(e.currency)}</Badge></TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{e.currency === "EGP" ? "—" : fmtNumber(e.rate, 4)}</TableCell>
                    <TableCell className={cn("font-bold tabular-nums", tone.text)}>{fmtEgp(e.amountEgp)}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(e.id)} aria-label="تعديل">
                          <Pencil className="size-4" />
                        </Button>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="year" value={year} />
                          <input type="hidden" name="month" value={month} />
                          <Button type="submit" variant="ghost" size="icon" className="size-8 text-rose-600 hover:text-rose-600" aria-label="حذف">
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
