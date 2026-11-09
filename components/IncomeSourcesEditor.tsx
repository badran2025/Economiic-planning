"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CURRENCIES } from "@/lib/constants";
import { fmtEgp, fmtNumber, toNum } from "@/lib/format";

type Source = {
  id: number;
  name: string;
  currency: string;
  defaultAmount: string | number;
  defaultRate: string | number;
};
type ServerAction = (fd: FormData) => Promise<void>;

function Fields({ s }: { s?: Source }) {
  const [currency, setCurrency] = useState(s?.currency ?? "EGP");
  const isEgp = currency === "EGP";
  return (
    <>
      <Input name="name" placeholder="اسم المصدر" defaultValue={s?.name ?? ""} required />
      <NativeSelect name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
        {CURRENCIES.map((c) => (
          <NativeSelectOption key={c.code} value={c.code}>{c.label}</NativeSelectOption>
        ))}
      </NativeSelect>
      <Input type="text" inputMode="decimal" name="defaultAmount" placeholder="المبلغ" defaultValue={s ? String(s.defaultAmount) : ""} required />
      <Input type="text" inputMode="decimal" name="defaultRate" placeholder="سعر التحويل" defaultValue={s ? String(s.defaultRate) : "1"} className={isEgp ? "hidden" : ""} />
    </>
  );
}

export default function IncomeSourcesEditor({
  items,
  addAction,
  updateAction,
  deleteAction,
}: {
  items: Source[];
  addAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const addRef = useRef<HTMLFormElement>(null);
  const grid = "grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]";

  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="text-base font-bold">مصادر الدخل الثابتة</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          بتتكرر كل شهر لما تضغط «توليد الدخل الثابت». المبلغ × سعر التحويل = الدخل بالجنيه.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && <span className="text-sm text-muted-foreground">لا يوجد بعد.</span>}
        {items.map((s) =>
          editingId === s.id ? (
            <form
              key={s.id}
              action={async (fd) => {
                await updateAction(fd);
                setEditingId(null);
              }}
              className={`${grid} items-center rounded-md bg-muted/50 p-2`}
            >
              <input type="hidden" name="id" value={s.id} />
              <Fields s={s} />
              <div className="col-span-2 flex gap-2 sm:col-span-1">
                <Button type="submit" size="sm">حفظ</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>إلغاء</Button>
              </div>
            </form>
          ) : (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
              <div className="flex flex-col">
                <span className="font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {fmtNumber(s.defaultAmount)} {s.currency}
                  {s.currency !== "EGP" ? ` × ${toNum(s.defaultRate)} = ${fmtEgp(toNum(s.defaultAmount) * toNum(s.defaultRate))} EGP` : ""}
                </span>
              </div>
              <span className="flex gap-0.5">
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(s.id)} aria-label="تعديل">
                  <Pencil className="size-4" />
                </Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <Button type="submit" variant="ghost" size="icon" className="size-8 text-rose-600 hover:text-rose-600" aria-label="حذف">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </span>
            </div>
          )
        )}
      </div>

      <form
        ref={addRef}
        action={async (fd) => {
          await addAction(fd);
          addRef.current?.reset();
        }}
        className={`${grid} items-center`}
      >
        <Fields />
        <Button type="submit">+ إضافة</Button>
      </form>
    </Card>
  );
}
