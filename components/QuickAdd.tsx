"use client";

import { useRef, useState } from "react";
import { CURRENCIES } from "@/lib/constants";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";
type ServerAction = (fd: FormData) => Promise<void>;

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const TYPES: { key: EntryType; label: string; color: string }[] = [
  { key: "income", label: "دخل", color: "var(--income)" },
  { key: "expense", label: "مصروف", color: "var(--expense)" },
  { key: "investment", label: "استثمار", color: "var(--invest)" },
];

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
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEgp = currency === "EGP";
  const effRate = isEgp ? 1 : toNum(rate) || 0;
  const egp = computeEgp(toNum(original), effRate);
  const meta = TYPES.find((t) => t.key === type)!;

  async function onSubmit(fd: FormData) {
    const d = (fd.get("occurredOn") ?? "").toString();
    const base = d || todayISO();
    const year = base.slice(0, 4);
    const month = String(parseInt(base.slice(5, 7), 10));
    fd.set("year", year);
    fd.set("month", month);
    if (!d) fd.set("occurredOn", base);
    setSaving(true);
    try {
      if (type === "income") await addIncome(fd);
      else if (type === "expense") await addExpense(fd);
      else await addInvestment(fd);
      formRef.current?.reset();
      setOriginal("");
      setRate("");
      setCurrency("EGP");
      const names: Record<EntryType, string> = {
        income: "الدخل",
        expense: "المصروف",
        investment: "الاستثمار",
      };
      setDone(`تم إضافة ${names[type]} ✓`);
      setTimeout(() => setDone(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  const labelText = type === "income" ? "البند / المصدر" : "البند";

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.9rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>إضافة سريعة</h2>
        {done && <span style={{ color: "var(--income)", fontWeight: 700, fontSize: "0.9rem" }}>{done}</span>}
      </div>

      {/* اختيار النوع */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className="btn"
            style={{
              borderColor: type === t.key ? t.color : "var(--border)",
              background: type === t.key ? t.color : "var(--surface-2)",
              color: type === t.key ? "#fff" : "var(--text)",
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        ref={formRef}
        action={onSubmit}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.7rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>التاريخ</span>
          <input className="field" type="date" name="occurredOn" defaultValue={todayISO()} />
        </label>

        {type === "expense" && (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span className="muted" style={{ fontSize: "0.72rem" }}>النوع</span>
              <select className="field" name="categoryId" defaultValue="">
                <option value="">— بدون —</option>
                {categories.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span className="muted" style={{ fontSize: "0.72rem" }}>الشخص</span>
              <select className="field" name="personId" defaultValue="">
                <option value="">— بدون —</option>
                {people.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
          </>
        )}

        {type === "investment" && (
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>الوجهة</span>
            <select className="field" name="destinationId" defaultValue="">
              <option value="">— بدون —</option>
              {destinations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>{labelText}</span>
          <input className="field" type="text" name="label" />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>المبلغ الأصلي</span>
          <input
            className="field"
            type="number"
            name="originalAmount"
            step="any"
            min="0"
            required
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>العملة</span>
          <select className="field" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: isEgp ? "none" : "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>سعر التحويل للجنيه</span>
          <input
            className="field"
            type="number"
            name="rate"
            step="any"
            min="0"
            placeholder="مثال 13.6"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>المقابل بالجنيه</span>
          <div className="field" style={{ background: "transparent", fontWeight: 700, color: meta.color }} aria-live="polite">
            {fmtEgp(egp)} ج.م
          </div>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>ملاحظات</span>
          <input className="field" type="text" name="note" />
        </label>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", background: meta.color, borderColor: meta.color }}>
            {saving ? "جارٍ الحفظ..." : `+ إضافة ${meta.label}`}
          </button>
        </div>
      </form>

      <p className="muted" style={{ fontSize: "0.76rem", margin: "0.8rem 0 0" }}>
        السنة والشهر بيتحددوا تلقائياً من التاريخ، والرقم بيتجمّع في بطاقة الشهر والسنة والإجمالي.
      </p>
    </section>
  );
}
