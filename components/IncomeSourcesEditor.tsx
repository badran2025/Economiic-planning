"use client";

import { useRef, useState } from "react";
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
      <input className="field" name="name" placeholder="اسم المصدر" defaultValue={s?.name ?? ""} required />
      <select className="field" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      <input className="field" type="text" inputMode="decimal" step="any" min="0" name="defaultAmount" placeholder="المبلغ" defaultValue={s ? String(s.defaultAmount) : ""} required />
      <input
        className="field"
        type="text" inputMode="decimal"
        step="any"
        min="0"
        name="defaultRate"
        placeholder="سعر التحويل"
        defaultValue={s ? String(s.defaultRate) : "1"}
        style={{ display: isEgp ? "none" : "block" }}
      />
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
  const gridCols = "repeat(auto-fit, minmax(130px, 1fr))";

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>مصادر الدخل الثابتة</h3>
      <p className="muted" style={{ margin: "0 0 0.8rem", fontSize: "0.8rem" }}>
        دي بتتكرر كل شهر لما تضغط &quot;توليد الدخل الثابت&quot; داخل الشهر. المبلغ × سعر التحويل = الدخل بالجنيه.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.9rem" }}>
        {items.length === 0 && <span className="muted" style={{ fontSize: "0.85rem" }}>لا يوجد بعد.</span>}
        {items.map((s) =>
          editingId === s.id ? (
            <form
              key={s.id}
              action={async (fd) => {
                await updateAction(fd);
                setEditingId(null);
              }}
              style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0.4rem", alignItems: "center", background: "var(--surface-2)", padding: "0.6rem", borderRadius: 8 }}
            >
              <input type="hidden" name="id" value={s.id} />
              <Fields s={s} />
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <button className="btn btn-primary" type="submit">حفظ</button>
                <button className="btn" type="button" onClick={() => setEditingId(null)}>إلغاء</button>
              </div>
            </form>
          ) : (
            <div
              key={s.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.5rem 0.7rem", background: "var(--surface-2)", borderRadius: 8 }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {fmtNumber(s.defaultAmount)} {s.currency}
                  {s.currency !== "EGP" ? ` × ${toNum(s.defaultRate)} = ${fmtEgp(toNum(s.defaultAmount) * toNum(s.defaultRate))} EGP` : ""}
                </span>
              </div>
              <span style={{ display: "flex", gap: "0.1rem" }}>
                <button className="btn btn-ghost" type="button" onClick={() => setEditingId(s.id)} title="تعديل">✎</button>
                <form action={deleteAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={s.id} />
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
        <Fields />
        <button className="btn btn-primary" type="submit">+ إضافة</button>
      </form>
    </section>
  );
}
