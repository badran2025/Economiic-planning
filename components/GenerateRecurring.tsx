"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";

export type GItem = {
  key: string;
  label: string;
  currency: string;
  original: string;
  rate: string;
  personId: number | null;
  categoryId: number | null;
  sourceId: number | null;
};

type Row = GItem & { selected: boolean };
type Tone = "income" | "expense";

const TONES = {
  income: {
    text: "text-emerald-600 dark:text-emerald-400",
    trigger: "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300",
    submit: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  },
  expense: {
    text: "text-rose-600 dark:text-rose-400",
    trigger: "border-rose-500/40 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300",
    submit: "bg-rose-600 text-white hover:bg-rose-600/90",
  },
};

export default function GenerateRecurring({
  triggerLabel,
  title,
  tone,
  items,
  emptyText,
  onConfirm,
}: {
  triggerLabel: string;
  title: string;
  tone: Tone;
  items: GItem[];
  emptyText: string;
  onConfirm: (rows: GItem[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const t = TONES[tone];

  useEffect(() => {
    if (open) setRows(items.map((it) => ({ ...it, selected: true })));
  }, [open, items]);

  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const selected = rows.filter((r) => r.selected);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const total = selected.reduce((a, r) => a + computeEgp(toNum(r.original), r.currency === "EGP" ? 1 : toNum(r.rate) || 0), 0);

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm(
        selected.map((r) => ({
          key: r.key, label: r.label, currency: r.currency, original: r.original,
          rate: r.rate, personId: r.personId, categoryId: r.categoryId, sourceId: r.sourceId,
        }))
      );
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className={cn("w-fit", t.trigger)}>
          ⟳ {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>اختار البنود اللي عايز تضيفها، وتقدر تعدّل المبالغ قبل الإضافة.</DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => setRows((rs) => rs.map((r) => ({ ...r, selected: v === true })))}
                />
                تحديد الكل
              </Label>
              <span className="text-sm text-muted-foreground">
                الإجمالي: <span className={cn("font-bold tabular-nums", t.text)}>{fmtEgp(total)} EGP</span>
              </span>
            </div>

            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pe-1">
              {rows.map((r) => {
                const rEgp = computeEgp(toNum(r.original), r.currency === "EGP" ? 1 : toNum(r.rate) || 0);
                return (
                  <div
                    key={r.key}
                    className={cn(
                      "flex flex-wrap items-center gap-2 rounded-md border p-2 transition",
                      r.selected ? "bg-muted/50" : "opacity-55"
                    )}
                  >
                    <Checkbox checked={r.selected} onCheckedChange={(v) => update(r.key, { selected: v === true })} />
                    <Input className="h-8 flex-[2] basis-32" value={r.label} onChange={(e) => update(r.key, { label: e.target.value })} />
                    <div className="relative flex-1 basis-24">
                      <Input className="h-8 pe-10" type="text" inputMode="decimal" value={r.original} onChange={(e) => update(r.key, { original: e.target.value })} />
                      <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-muted-foreground">{r.currency}</span>
                    </div>
                    {r.currency !== "EGP" && (
                      <Input className="h-8 flex-1 basis-16" type="text" inputMode="decimal" placeholder="سعر" value={r.rate} onChange={(e) => update(r.key, { rate: e.target.value })} />
                    )}
                    <span className="min-w-20 text-left text-sm font-bold tabular-nums">{fmtEgp(rEgp)} EGP</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">إلغاء</Button>
          </DialogClose>
          <Button type="button" className={cn(t.submit)} disabled={saving || selected.length === 0} onClick={confirm}>
            اعتماد وإضافة ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
