import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import * as s from "./db/schema";
import { toNum } from "./format";

export type Totals = {
  income: number;
  expenses: number;
  investment: number;
  net: number;
};

function mkTotals(income: number, expenses: number, investment: number): Totals {
  return { income, expenses, investment, net: income - expenses - investment };
}

// ---------- الإعدادات ----------
export async function getSettings() {
  const db = getDb();
  const rows = await db.select().from(s.settings).where(eq(s.settings.id, 1)).limit(1);
  if (rows.length) return rows[0];
  const inserted = await db
    .insert(s.settings)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();
  if (inserted.length) return inserted[0];
  const again = await db.select().from(s.settings).where(eq(s.settings.id, 1)).limit(1);
  return again[0];
}

// ---------- الإجماليات العامة ----------
async function sumTable(table: typeof s.incomeEntries | typeof s.expenseEntries | typeof s.investmentEntries) {
  const db = getDb();
  const r = await db
    .select({ total: sql<string>`coalesce(sum(${table.amountEgp}), 0)` })
    .from(table);
  return toNum(r[0]?.total);
}

export async function getGrandTotals(): Promise<Totals> {
  const [income, expenses, investment] = await Promise.all([
    sumTable(s.incomeEntries),
    sumTable(s.expenseEntries),
    sumTable(s.investmentEntries),
  ]);
  return mkTotals(income, expenses, investment);
}

// ---------- السنوات ----------
async function groupByYear(table: typeof s.incomeEntries | typeof s.expenseEntries | typeof s.investmentEntries) {
  const db = getDb();
  const rows = await db
    .select({ year: table.year, total: sql<string>`coalesce(sum(${table.amountEgp}), 0)` })
    .from(table)
    .groupBy(table.year);
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.year, toNum(r.total));
  return map;
}

export async function getYearsWithTotals(): Promise<(Totals & { year: number })[]> {
  const db = getDb();
  const [inc, exp, inv, declared] = await Promise.all([
    groupByYear(s.incomeEntries),
    groupByYear(s.expenseEntries),
    groupByYear(s.investmentEntries),
    db.select().from(s.years),
  ]);
  const yearSet = new Set<number>();
  for (const y of declared) yearSet.add(y.year);
  for (const m of [inc, exp, inv]) for (const k of m.keys()) yearSet.add(k);
  const list = [...yearSet].sort((a, b) => b - a).map((year) => ({
    year,
    ...mkTotals(inc.get(year) ?? 0, exp.get(year) ?? 0, inv.get(year) ?? 0),
  }));
  return list;
}

export async function getYearTotals(year: number): Promise<Totals> {
  const db = getDb();
  const one = async (
    table: typeof s.incomeEntries | typeof s.expenseEntries | typeof s.investmentEntries
  ) => {
    const r = await db
      .select({ total: sql<string>`coalesce(sum(${table.amountEgp}), 0)` })
      .from(table)
      .where(eq(table.year, year));
    return toNum(r[0]?.total);
  };
  const [income, expenses, investment] = await Promise.all([
    one(s.incomeEntries),
    one(s.expenseEntries),
    one(s.investmentEntries),
  ]);
  return mkTotals(income, expenses, investment);
}

// ---------- الشهور داخل سنة ----------
async function groupByMonth(
  table: typeof s.incomeEntries | typeof s.expenseEntries | typeof s.investmentEntries,
  year: number
) {
  const db = getDb();
  const rows = await db
    .select({ month: table.month, total: sql<string>`coalesce(sum(${table.amountEgp}), 0)` })
    .from(table)
    .where(eq(table.year, year))
    .groupBy(table.month);
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.month, toNum(r.total));
  return map;
}

export async function getMonthlyTotals(year: number): Promise<(Totals & { month: number })[]> {
  const [inc, exp, inv] = await Promise.all([
    groupByMonth(s.incomeEntries, year),
    groupByMonth(s.expenseEntries, year),
    groupByMonth(s.investmentEntries, year),
  ]);
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { month, ...mkTotals(inc.get(month) ?? 0, exp.get(month) ?? 0, inv.get(month) ?? 0) };
  });
}

export async function getMonthTotals(year: number, month: number): Promise<Totals> {
  const db = getDb();
  const one = async (
    table: typeof s.incomeEntries | typeof s.expenseEntries | typeof s.investmentEntries
  ) => {
    const r = await db
      .select({ total: sql<string>`coalesce(sum(${table.amountEgp}), 0)` })
      .from(table)
      .where(and(eq(table.year, year), eq(table.month, month)));
    return toNum(r[0]?.total);
  };
  const [income, expenses, investment] = await Promise.all([
    one(s.incomeEntries),
    one(s.expenseEntries),
    one(s.investmentEntries),
  ]);
  return mkTotals(income, expenses, investment);
}

// ---------- القوائم (الإعدادات/التصنيفات) ----------
export async function getPeople() {
  return getDb().select().from(s.people).orderBy(asc(s.people.sortOrder), asc(s.people.id));
}
export async function getCategories() {
  return getDb().select().from(s.categories).orderBy(asc(s.categories.sortOrder), asc(s.categories.id));
}
export async function getIncomeSources() {
  return getDb().select().from(s.incomeSources).orderBy(asc(s.incomeSources.sortOrder), asc(s.incomeSources.id));
}
export async function getInvestmentDestinations() {
  return getDb()
    .select()
    .from(s.investmentDestinations)
    .orderBy(asc(s.investmentDestinations.sortOrder), asc(s.investmentDestinations.id));
}
export async function getPlannedExpenses() {
  return getDb().select().from(s.plannedExpenses).orderBy(asc(s.plannedExpenses.sortOrder), asc(s.plannedExpenses.id));
}

// ---------- عمليات الشهر ----------
export async function getMonthIncome(year: number, month: number) {
  const db = getDb();
  return db
    .select()
    .from(s.incomeEntries)
    .where(and(eq(s.incomeEntries.year, year), eq(s.incomeEntries.month, month)))
    .orderBy(asc(s.incomeEntries.occurredOn), asc(s.incomeEntries.id));
}

export async function getMonthExpenses(year: number, month: number) {
  const db = getDb();
  return db
    .select({
      id: s.expenseEntries.id,
      year: s.expenseEntries.year,
      month: s.expenseEntries.month,
      categoryId: s.expenseEntries.categoryId,
      personId: s.expenseEntries.personId,
      label: s.expenseEntries.label,
      currency: s.expenseEntries.currency,
      originalAmount: s.expenseEntries.originalAmount,
      rate: s.expenseEntries.rate,
      amountEgp: s.expenseEntries.amountEgp,
      occurredOn: s.expenseEntries.occurredOn,
      note: s.expenseEntries.note,
      categoryName: s.categories.name,
      personName: s.people.name,
    })
    .from(s.expenseEntries)
    .leftJoin(s.categories, eq(s.expenseEntries.categoryId, s.categories.id))
    .leftJoin(s.people, eq(s.expenseEntries.personId, s.people.id))
    .where(and(eq(s.expenseEntries.year, year), eq(s.expenseEntries.month, month)))
    .orderBy(asc(s.expenseEntries.occurredOn), asc(s.expenseEntries.id));
}

export async function getMonthInvestments(year: number, month: number) {
  const db = getDb();
  return db
    .select({
      id: s.investmentEntries.id,
      year: s.investmentEntries.year,
      month: s.investmentEntries.month,
      destinationId: s.investmentEntries.destinationId,
      label: s.investmentEntries.label,
      currency: s.investmentEntries.currency,
      originalAmount: s.investmentEntries.originalAmount,
      rate: s.investmentEntries.rate,
      amountEgp: s.investmentEntries.amountEgp,
      occurredOn: s.investmentEntries.occurredOn,
      note: s.investmentEntries.note,
      destinationName: s.investmentDestinations.name,
    })
    .from(s.investmentEntries)
    .leftJoin(
      s.investmentDestinations,
      eq(s.investmentEntries.destinationId, s.investmentDestinations.id)
    )
    .where(and(eq(s.investmentEntries.year, year), eq(s.investmentEntries.month, month)))
    .orderBy(asc(s.investmentEntries.occurredOn), asc(s.investmentEntries.id));
}

// ---------- الخطة (الثابتة) للمقارنة ----------
export type PlanSummary = {
  plannedIncome: number;
  plannedExpenses: number;
  plannedSurplus: number;
  plannedInvestment: number;
  destinations: { id: number; name: string; percentage: number | null; planned: number }[];
};

export async function getPlanSummary(): Promise<PlanSummary> {
  const [sources, planned, dests] = await Promise.all([
    getIncomeSources(),
    getPlannedExpenses(),
    getInvestmentDestinations(),
  ]);
  const plannedIncome = sources
    .filter((x) => x.active)
    .reduce((a, x) => a + toNum(x.defaultAmount) * toNum(x.defaultRate), 0);
  const plannedExpenses = planned.reduce((a, x) => a + toNum(x.amountEgp), 0);
  const plannedSurplus = Math.max(plannedIncome - plannedExpenses, 0);
  const destinations = dests
    .filter((d) => d.active)
    .map((d) => ({
      id: d.id,
      name: d.name,
      percentage: d.percentage === null ? null : toNum(d.percentage),
      planned: d.percentage === null ? 0 : toNum(d.percentage) * plannedSurplus,
    }));
  const plannedInvestment = destinations.reduce((a, d) => a + d.planned, 0);
  return { plannedIncome, plannedExpenses, plannedSurplus, plannedInvestment, destinations };
}

// ---------- تقدّم الاستثمار (تراكمي مقابل الهدف) ----------
export async function getInvestmentProgress() {
  const db = getDb();
  const dests = await getInvestmentDestinations();
  const rows = await db
    .select({
      destinationId: s.investmentEntries.destinationId,
      total: sql<string>`coalesce(sum(${s.investmentEntries.amountEgp}), 0)`,
    })
    .from(s.investmentEntries)
    .groupBy(s.investmentEntries.destinationId);
  const map = new Map<number | null, number>();
  for (const r of rows) map.set(r.destinationId, toNum(r.total));
  return dests.map((d) => ({
    id: d.id,
    name: d.name,
    target: d.targetAmount === null ? null : toNum(d.targetAmount),
    actual: map.get(d.id) ?? 0,
  }));
}
