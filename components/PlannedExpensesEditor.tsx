"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { fmtEgp, toNum } from "@/lib/format";

type Opt = { id: number; name: string };
type Planned = {
  id: number;
  label: string;
  personId: number | null;
  categoryId: number | null;
  amountEgp: string | number;
};
type ServerAction = (fd: FormData) => Promise<void>;

function Fields({ p, people, categories }: { p?: Planned; people: Opt[]; categories: Opt[] }) {
  return (
    <>
      <Input name="label" placeholder="اسم البند" defaultValue={p?.label ?? ""} required />
      <NativeSelect name="categoryId" defaultValue={p?.categoryId ?? ""}>
        <NativeSelectOption value="">مركز التكلفة — بدون</NativeSelectOption>
        {categories.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect name="personId" defaultValue={p?.personId ?? ""}>
        <NativeSelectOption value="">المستفيد — بدون</NativeSelectOption>
        {people.map((o) => (
          <NativeSelectOption key={o.id} value={o.id}>{o.name}</NativeSelectOption>
        ))}
      </NativeSelect>
      <Input type="text" inputMode="decimal" name="amountEgp" placeholder="المبلغ بالجنيه" defaultValue={p ? String(p.amountEgp) : ""} required />
    </>
  );
}

export default function PlannedExpensesEditor({
  items,
  people,
  categories,
  addAction,
  updateAction,
  deleteAction,
}: {
  items: Planned[];
  people: Opt[];
  categories: Opt[];
  addAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const addRef = useRef<HTMLFormElement>(null);
  const grid = "grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]";
  const total = items.reduce((a, x) => a + toNum(x.amountEgp), 0);

  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="text-base font-bold">
          بنود المصروفات المخطّطة <span className="text-rose-600 dark:text-rose-400 tabular-nums">({fmtEgp(total)} EGP)</span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          الميزانية الشهرية المتوقعة، تُستخدم في مقارنة «الخطة مقابل الفعلي» وفي «توليد المصروف الثابت».
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && <span className="text-sm text-muted-foreground">لا يوجد بعد.</span>}
        {items.map((p) =>
          editingId === p.id ? (
            <form
              key={p.id}
              action={async (fd) => {
                await updateAction(fd);
                setEditingId(null);
              }}
              className={`${grid} items-center rounded-md bg-muted/50 p-2`}
            >
              <input type="hidden" name="id" value={p.id} />
              <Fields p={p} people={people} categories={categories} />
              <div className="flex gap-2">
                <Button type="submit" size="sm">حفظ</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>إلغاء</Button>
              </div>
            </form>
          ) : (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
              <span className="font-semibold">
                {p.label} <span className="text-sm font-normal text-muted-foreground tabular-nums">— {fmtEgp(p.amountEgp)} EGP</span>
              </span>
              <span className="flex gap-0.5">
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(p.id)} aria-label="تعديل">
                  <Pencil className="size-4" />
                </Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={p.id} />
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
        <Fields people={people} categories={categories} />
        <Button type="submit">+ إضافة</Button>
      </form>
    </Card>
  );
}
