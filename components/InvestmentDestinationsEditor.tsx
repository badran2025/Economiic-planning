"use client";

import { useRef, useState } from "react";
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
      <input className="field" name="name" placeholder="اسم الوجهة" defaultValue={d?.name ?? ""} required />
      <input
        className="field"
        type="text" inputMode="decimal"
        step="any"
        min="0"
        max="100"
        name="percentage"
        placeholder="% من الفائض"
        defaultValue={d && d.percentage !== null ? String(Math.round(toNum(d.percentage) * 100 * 100) / 100) : ""}
      />
      <input
        className="field"
        type="text" inputMode="decimal"
        step="any"
        min="0"
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
  const gridCols = "repeat(auto-fit, minmax(130px, 1fr))";
  const progMap = new Map(progress.map((p) => [p.id, p]));

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>وجهات الاستثمار / توزيع الفائض</h3>
      <p className="muted" style={{ margin: "0 0 0.8rem", fontSize: "0.8rem" }}>
        النسبة من الفائض اختيارية (للمقارنة بالخطة)، والهدف اختياري لمتابعة كام وصلت.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.9rem" }}>
        {items.length === 0 && <span className="muted" style={{ fontSize: "0.85rem" }}>لا يوجد بعد.</span>}
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
                style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0.4rem", alignItems: "center", background: "var(--surface-2)", padding: "0.6rem", borderRadius: 8 }}
              >
                <input type="hidden" name="id" value={d.id} />
                <Fields d={d} />
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button className="btn btn-primary" type="submit">حفظ</button>
                  <button className="btn" type="button" onClick={() => setEditingId(null)}>إلغاء</button>
                </div>
              </form>
            );
          }
          return (
            <div key={d.id} style={{ padding: "0.6rem 0.7rem", background: "var(--surface-2)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>{" "}
                  {d.percentage !== null && (
                    <span className="chip">{fmtPercent(toNum(d.percentage))} من الفائض</span>
                  )}
                </div>
                <span style={{ display: "flex", gap: "0.1rem" }}>
                  <button className="btn btn-ghost" type="button" onClick={() => setEditingId(d.id)} title="تعديل">✎</button>
                  <form action={deleteAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="btn btn-danger" type="submit" title="حذف">🗑</button>
                  </form>
                </span>
              </div>
              <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>
                المُجمّع: <strong style={{ color: "var(--invest)" }}>{fmtEgp(actual)} EGP</strong>
                {target !== null && <> من {fmtEgp(target)} EGP</>}
              </div>
              {ratio !== null && (
                <div style={{ height: 8, background: "var(--border)", borderRadius: 999, marginTop: "0.4rem", overflow: "hidden" }}>
                  <div style={{ width: `${ratio * 100}%`, height: "100%", background: "var(--invest)" }} />
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
        style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0.4rem", alignItems: "center" }}
      >
        <Fields />
        <button className="btn btn-primary" type="submit">+ إضافة</button>
      </form>
    </section>
  );
}
