"use client";

import { useRef, useState } from "react";
import GenerateRecurring, { type GItem } from "@/components/GenerateRecurring";
import { CURRENCIES, currencySymbol } from "@/lib/constants";
import { computeEgp, fmtEgp, fmtNumber, toNum } from "@/lib/format";

type Opt = { id: number; name: string };
type EntryType = "income" | "expense" | "investment";

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

type IncomeBatch = (p: {
  year: number; month: number; occurredOn: string | null;
  items: { sourceId: number | null; label: string; currency: string; originalAmount: number; rate: number }[];
}) => Promise<void>;
type ExpenseBatch = (p: {
  year: number; month: number; occurredOn: string | null;
  items: { label: string; personId: number | null; categoryId: number | null; amountEgp: number }[];
}) => Promise<void>;

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
  genItems?: GItem[];
  commitIncome?: IncomeBatch;
  commitExpense?: ExpenseBatch;
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
            <span className="muted" style={{ fontSize: "0.72rem" }}>مراكز التكلفة</span>
            <select className="field" name="categoryId" defaultValue={entry?.categoryId ?? ""}>
              <option value="">— بدون —</option>
              {(categories ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span className="muted" style={{ fontSize: "0.72rem" }}>المستفيد</span>
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
          {type === "income" ? "اسم الدخل / المصدر" : "الوصف / البيان"}
        </span>
        <input
          className="field"
          type="text"
          name="label"
          defaultValue={entry?.label ?? ""}
          placeholder={type === "income" ? "مثلاً: مكافأة" : "وصف مختصر (اختياري)"}
        />
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
    genItems,
    commitIncome,
    commitExpense,
  } = props;

  async function confirmGenerate(rows: GItem[]) {
    if (type === "income" && commitIncome) {
      await commitIncome({
        year,
        month,
        occurredOn: null,
        items: rows.map((r) => ({
          sourceId: r.sourceId,
          label: r.label,
          currency: r.currency,
          originalAmount: toNum(r.original),
          rate: toNum(r.rate) || 1,
        })),
      });
    } else if (type === "expense" && commitExpense) {
      await commitExpense({
        year,
        month,
        occurredOn: null,
        items: rows.map((r) => ({
          label: r.label,
          personId: r.personId,
          categoryId: r.categoryId,
          amountEgp: toNum(r.original),
        })),
      });
    }
  }

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
          {genItems && (type === "income" || type === "expense") && (
            <GenerateRecurring
              triggerLabel={type === "expense" ? "توليد المصروف الثابت" : "توليد الدخل الثابت"}
              title={type === "expense" ? "اختر بنود المصروف الثابت" : "اختر بنود الدخل الثابت"}
              color={type === "expense" ? "red" : "green"}
              items={genItems}
              emptyText={
                type === "expense"
                  ? "مفيش بنود مصروفات مخطّطة محفوظة. ضيفها من الإعدادات."
                  : "مفيش مصادر دخل ثابتة محفوظة. ضيفها من الإعدادات."
              }
              onConfirm={confirmGenerate}
            />
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
          <p className="muted" style={{ gridColumn: "1 / -1", margin: 0, fontSize: "0.72rem" }}>
            {type === "income"
              ? "إضافة بند دخل جديد يدوي. للبنود الثابتة المحفوظة استخدم زر «توليد الدخل الثابت»."
              : type === "expense"
              ? "إضافة بند مصروف جديد يدوي. للبنود الثابتة المحفوظة استخدم زر «توليد المصروف الثابت»."
              : "إضافة بند استثمار جديد."}
          </p>
          <ClassifierInputs type={type} people={people} categories={categories} destinations={destinations} />
          <CurrencyInputs />
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
                {type === "expense" && <th>مراكز التكلفة</th>}
                {type === "expense" && <th>المستفيد</th>}
                {type === "investment" && <th>الوجهة</th>}
                <th>الوصف</th>
                <th>الأصلي</th>
                <th>العملة</th>
                <th>السعر</th>
                <th>EGP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const colCount = 6 + classifierCols;
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
                    {type === "expense" && <td>{e.categoryName ?? "—"}</td>}
                    {type === "expense" && <td>{e.personName ?? "—"}</td>}
                    {type === "investment" && <td>{e.destinationName ?? "—"}</td>}
                    <td>{e.label || "—"}</td>
                    <td>{fmtNumber(e.originalAmount)}</td>
                    <td><span className="chip">{currencySymbol(e.currency)}</span></td>
                    <td className="muted">{e.currency === "EGP" ? "—" : fmtNumber(e.rate, 4)}</td>
                    <td style={{ fontWeight: 700, color }}>{fmtEgp(e.amountEgp)}</td>
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
