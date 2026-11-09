"use client";

import { useRef, useState } from "react";
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
      <input className="field" name="label" placeholder="اسم البند" defaultValue={p?.label ?? ""} required />
      <select className="field" name="categoryId" defaultValue={p?.categoryId ?? ""}>
        <option value="">النوع — بدون</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select className="field" name="personId" defaultValue={p?.personId ?? ""}>
        <option value="">الشخص — بدون</option>
        {people.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <input className="field" type="number" step="any" min="0" name="amountEgp" placeholder="المبلغ بالجنيه" defaultValue={p ? String(p.amountEgp) : ""} required />
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
  const gridCols = "repeat(auto-fit, minmax(130px, 1fr))";
  const total = items.reduce((a, x) => a + toNum(x.amountEgp), 0);

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>
        بنود المصروفات المخطّطة{" "}
        <span style={{ color: "var(--expense)", fontWeight: 800 }}>({fmtEgp(total)} EGP)</span>
      </h3>
      <p className="muted" style={{ margin: "0 0 0.8rem", fontSize: "0.8rem" }}>
        دي الميزانية الشهرية المتوقعة للمصروفات، بتُستخدم في مقارنة &quot;الخطة مقابل الفعلي&quot; في كل شهر.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.9rem" }}>
        {items.length === 0 && <span className="muted" style={{ fontSize: "0.85rem" }}>لا يوجد بعد.</span>}
        {items.map((p) =>
          editingId === p.id ? (
            <form
              key={p.id}
              action={async (fd) => {
                await updateAction(fd);
                setEditingId(null);
              }}
              style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0.4rem", alignItems: "center", background: "var(--surface-2)", padding: "0.6rem", borderRadius: 8 }}
            >
              <input type="hidden" name="id" value={p.id} />
              <Fields p={p} people={people} categories={categories} />
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <button className="btn btn-primary" type="submit">حفظ</button>
                <button className="btn" type="button" onClick={() => setEditingId(null)}>إلغاء</button>
              </div>
            </form>
          ) : (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.5rem 0.7rem", background: "var(--surface-2)", borderRadius: 8 }}>
              <span style={{ fontWeight: 600 }}>
                {p.label}{" "}
                <span className="muted" style={{ fontWeight: 400, fontSize: "0.82rem" }}>— {fmtEgp(p.amountEgp)} EGP</span>
              </span>
              <span style={{ display: "flex", gap: "0.1rem" }}>
                <button className="btn btn-ghost" type="button" onClick={() => setEditingId(p.id)} title="تعديل">✎</button>
                <form action={deleteAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btn-danger" type="submit" title="حذف">🗑</button>
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
        style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0.4rem", alignItems: "center" }}
      >
        <Fields people={people} categories={categories} />
        <button className="btn btn-primary" type="submit">+ إضافة</button>
      </form>
    </section>
  );
}
