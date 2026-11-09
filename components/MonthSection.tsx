"use client";

import { useRef, useState } from "react";
import { CURRENCIES, currencySymbol } from "@/lib/constants";
import { computeEgp, fmtEgp, fmtNumber, toNum } from "@/lib/format";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

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

type Props = {
  type: EntryType;
  title: string;
  color: string;
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
  generateAction?: ServerAction;
};

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
  const effRate = isEgp ? 1 : toNum(rate) || 0;
  const egp = computeEgp(toNum(original), effRate);

  return (
    <>
      <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span className="muted" style={{ fontSize: "0.72rem" }}>المبلغ الأصلي</span>
        <input
          className="field"
          type="text" inputMode="decimal"
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
        <select
          className="field"
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label
        style={{
          display: isEgp ? "none" : "flex",
          flexDirection: "column",
          gap: "0.2rem",
        }}
      >
        <span className="muted" style={{ fontSize: "0.72rem" }}>سعر التحويل للجنيه</span>
        <input
          className="field"
          type="text" inputMode="decimal"
          name="rate"
          step="any"
          min="0"
          value={rate}
          placeholder="مثال 13.6"
          onChange={(e) => setRate(e.target.value)}
        />
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span className="muted" style={{ fontSize: "0.72rem" }}>المقابل بالجنيه</span>
        <div className="field" style={{ background: "transparent", fontWeight: 700 }} aria-live="polite">
          {fmtEgp(egp)} EGP
        </div>
      </div>
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
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>النوع</span>
            <select className="field" name="categoryId" defaultValue={entry?.categoryId ?? ""}>
              <option value="">— بدون —</option>
              {(categories ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>الشخص</span>
            <select className="field" name="personId" defaultValue={entry?.personId ?? ""}>
              <option value="">— بدون —</option>
              {(people ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {type === "investment" && (
        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span className="muted" style={{ fontSize: "0.72rem" }}>الوجهة</span>
          <select className="field" name="destinationId" defaultValue={entry?.destinationId ?? ""}>
            <option value="">— بدون —</option>
            {(destinations ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
      )}
      <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span className="muted" style={{ fontSize: "0.72rem" }}>
          {type === "income" ? "البند / المصدر" : "البند"}
        </span>
        <input className="field" type="text" name="label" defaultValue={entry?.label ?? ""} />
      </label>
    </>
  );
}

export default function MonthSection(props: Props) {
  const {
    type,
    title,
    color,
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
    generateAction,
  } = props;

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const addFormRef = useRef<HTMLFormElement>(null);

  const classifierCols = type === "expense" ? 2 : type === "investment" ? 1 : 0;

  return (
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.6rem",
          marginBottom: "0.9rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
          {title}
          <span style={{ fontWeight: 800, color }}>{fmtEgp(total)} EGP</span>
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {generateAction && (
            <form action={generateAction}>
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="month" value={month} />
              <button
                className="btn"
                type="submit"
                title={type === "expense" ? "إنشاء بنود المصروفات من الخطة الثابتة" : "إنشاء بنود الدخل من المصادر الثابتة"}
              >
                ⟳ {type === "expense" ? "توليد المصروف الثابت" : "توليد الدخل الثابت"}
              </button>
            </form>
          )}
          <button className="btn btn-primary" type="button" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "× إغلاق" : "+ إضافة"}
          </button>
        </div>
      </div>

      {showAdd && (
        <form
          ref={addFormRef}
          action={async (fd) => {
            await addAction(fd);
            addFormRef.current?.reset();
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.7rem",
            padding: "0.9rem",
            background: "var(--surface-2)",
            border: "1px dashed var(--border)",
            borderRadius: 12,
            marginBottom: "1rem",
          }}
        >
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>التاريخ</span>
            <input className="field" type="text" inputMode="numeric" placeholder="YYYY-MM-DD" name="occurredOn" defaultValue={todayISO()} />
          </label>
          <ClassifierInputs type={type} people={people} categories={categories} destinations={destinations} />
          <CurrencyInputs />
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>ملاحظات</span>
            <input className="field" type="text" name="note" />
          </label>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              حفظ
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: "0.6rem" }}>
          مفيش بنود في الشهر ده.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>التاريخ</th>
                {type === "expense" && <th>النوع</th>}
                {type === "expense" && <th>الشخص</th>}
                {type === "investment" && <th>الوجهة</th>}
                <th>البند</th>
                <th>الأصلي</th>
                <th>العملة</th>
                <th>السعر</th>
                <th>EGP</th>
                <th>ملاحظات</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const colCount = 7 + classifierCols + 1 + 1;
                if (editingId === e.id) {
                  return (
                    <tr key={e.id}>
                      <td colSpan={colCount} style={{ padding: 0 }}>
                        <form
                          action={async (fd) => {
                            await updateAction(fd);
                            setEditingId(null);
                          }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "0.7rem",
                            padding: "0.9rem",
                            background: "var(--surface-2)",
                          }}
                        >
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="year" value={year} />
                          <input type="hidden" name="month" value={month} />
                          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span className="muted" style={{ fontSize: "0.72rem" }}>التاريخ</span>
                            <input className="field" type="text" inputMode="numeric" placeholder="YYYY-MM-DD" name="occurredOn" defaultValue={e.occurredOn ?? ""} />
                          </label>
                          <ClassifierInputs
                            type={type}
                            people={people}
                            categories={categories}
                            destinations={destinations}
                            entry={e}
                          />
                          <CurrencyInputs
                            
                            defaultCurrency={e.currency}
                            defaultOriginal={e.originalAmount}
                            defaultRate={e.rate}
                          />
                          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span className="muted" style={{ fontSize: "0.72rem" }}>ملاحظات</span>
                            <input className="field" type="text" name="note" defaultValue={e.note ?? ""} />
                          </label>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
                            <button className="btn btn-primary" type="submit">حفظ</button>
                            <button className="btn" type="button" onClick={() => setEditingId(null)}>
                              إلغاء
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={e.id}>
                    <td className="muted">{e.occurredOn ?? "—"}</td>
                    {type === "expense" && <td>{e.categoryName ?? "—"}</td>}
                    {type === "expense" && <td>{e.personName ?? "—"}</td>}
                    {type === "investment" && <td>{e.destinationName ?? "—"}</td>}
                    <td>{e.label || "—"}</td>
                    <td>{fmtNumber(e.originalAmount)}</td>
                    <td><span className="chip">{currencySymbol(e.currency)}</span></td>
                    <td className="muted">{e.currency === "EGP" ? "—" : fmtNumber(e.rate, 4)}</td>
                    <td style={{ fontWeight: 700, color }}>{fmtEgp(e.amountEgp)}</td>
                    <td className="muted" style={{ whiteSpace: "normal", maxWidth: 180 }}>{e.note || ""}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.1rem" }}>
                        <button className="btn btn-ghost" type="button" onClick={() => setEditingId(e.id)} title="تعديل">
                          ✎
                        </button>
                        <form action={deleteAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="year" value={year} />
                          <input type="hidden" name="month" value={month} />
                          <button className="btn btn-danger" type="submit" title="حذف">🗑</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
