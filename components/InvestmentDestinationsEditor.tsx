"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fmtEgp, fmtPercent, toNum } from "@/lib/format";

type Dest = {
  id: number;
  name: string;
  percentage: string | number | null;
  targetAmount: string | number | null;
};
type Progress = { id: number; actual: number; target: number | null };
type ServerAction = (fd: FormData) => Promise<void>;

function Fields({ d }: { d?: Dest }) {
  return (
    <>
      <Input name="name" placeholder="اسم الوجهة" defaultValue={d?.name ?? ""} required />
      <Input
        type="text"
        inputMode="decimal"
        name="percentage"
        placeholder="% من الفائض"
        defaultValue={d && d.percentage !== null ? String(Math.round(toNum(d.percentage) * 100 * 100) / 100) : ""}
      />
      <Input
        type="text"
        inputMode="decimal"
        name="targetAmount"
        placeholder="الهدف (اختياري)"
        defaultValue={d && d.targetAmount !== null ? String(d.targetAmount) : ""}
      />
    </>
  );
}

export default function InvestmentDestinationsEditor({
  items,
  progress,
  addAction,
  updateAction,
  deleteAction,
}: {
  items: Dest[];
  progress: Progress[];
  addAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const addRef = useRef<HTMLFormElement>(null);
  const grid = "grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]";
  const progMap = new Map(progress.map((p) => [p.id, p]));

  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="text-base font-bold">وجهات الاستثمار / توزيع الفائض</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          النسبة من الفائض اختيارية (للمقارنة بالخطة)، والهدف اختياري لمتابعة كام وصلت.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && <span className="text-sm text-muted-foreground">لا يوجد بعد.</span>}
        {items.map((d) => {
          const p = progMap.get(d.id);
          const actual = p?.actual ?? 0;
          const target = d.targetAmount !== null ? toNum(d.targetAmount) : null;
          const ratio = target && target > 0 ? Math.min(actual / target, 1) : null;
          if (editingId === d.id) {
            return (
              <form
                key={d.id}
                action={async (fd) => {
                  await updateAction(fd);
                  setEditingId(null);
                }}
                className={`${grid} items-center rounded-md bg-muted/50 p-2`}
              >
                <input type="hidden" name="id" value={d.id} />
                <Fields d={d} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">حفظ</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>إلغاء</Button>
                </div>
              </form>
            );
          }
          return (
            <div key={d.id} className="rounded-md bg-muted/50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  {d.percentage !== null && <Badge variant="secondary">{fmtPercent(toNum(d.percentage))} من الفائض</Badge>}
                </div>
                <span className="flex gap-0.5">
                  <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(d.id)} aria-label="تعديل">
                    <Pencil className="size-4" />
                  </Button>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <Button type="submit" variant="ghost" size="icon" className="size-8 text-rose-600 hover:text-rose-600" aria-label="حذف">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                المُجمّع: <strong className="text-blue-600 dark:text-blue-400">{fmtEgp(actual)} EGP</strong>
                {target !== null && <> من {fmtEgp(target)} EGP</>}
              </div>
              {ratio !== null && (
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-blue-500" style={{ width: `${ratio * 100}%` }} />
                </div>
              )}
            </div>
          );
        })}
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
