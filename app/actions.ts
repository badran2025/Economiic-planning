"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { computeEgp, toNum } from "@/lib/format";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_INVESTMENT_DESTINATIONS,
  DEFAULT_PEOPLE,
} from "@/lib/constants";

// ---------- أدوات مساعدة ----------
function str(fd: FormData, key: string): string {
  return (fd.get(key) ?? "").toString().trim();
}
function num(fd: FormData, key: string): number {
  return toNum(str(fd, key));
}
function intOrNull(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function dateOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v || null;
}

async function ensureYear(year: number) {
  if (!Number.isFinite(year)) return;
  await getDb().insert(s.years).values({ year }).onConflictDoNothing();
}

function revalidateMonth(year: number, month: number) {
  revalidatePath("/");
  revalidatePath(`/year/${year}`);
  revalidatePath(`/year/${year}/month/${month}`);
}
function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------- الإعدادات ----------
export async function updateSettings(fd: FormData) {
  await getDb()
    .update(s.settings)
    .set({
      siteTitle: str(fd, "siteTitle") || "تخطيط الدخل",
      rateSar: String(num(fd, "rateSar") || 1),
      rateUsd: String(num(fd, "rateUsd") || 1),
      updatedAt: new Date(),
    })
    .where(eq(s.settings.id, 1));
  revalidateAll();
}

// ---------- السنوات ----------
export async function addYear(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  if (Number.isFinite(year)) {
    await ensureYear(year);
    revalidatePath("/");
  }
}

// ---------- الأشخاص ----------
export async function addPerson(fd: FormData) {
  const name = str(fd, "name");
  if (name) await getDb().insert(s.people).values({ name });
  revalidateAll();
}
export async function updatePerson(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().update(s.people).set({ name: str(fd, "name") }).where(eq(s.people.id, id));
  revalidateAll();
}
export async function deletePerson(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().delete(s.people).where(eq(s.people.id, id));
  revalidateAll();
}

// ---------- الأنواع ----------
export async function addCategory(fd: FormData) {
  const name = str(fd, "name");
  if (name) await getDb().insert(s.categories).values({ name });
  revalidateAll();
}
export async function updateCategory(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().update(s.categories).set({ name: str(fd, "name") }).where(eq(s.categories.id, id));
  revalidateAll();
}
export async function deleteCategory(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().delete(s.categories).where(eq(s.categories.id, id));
  revalidateAll();
}

// ---------- مصادر الدخل الثابتة ----------
export async function addIncomeSource(fd: FormData) {
  const name = str(fd, "name");
  if (name)
    await getDb().insert(s.incomeSources).values({
      name,
      currency: str(fd, "currency") || "EGP",
      defaultAmount: String(num(fd, "defaultAmount")),
      defaultRate: String(num(fd, "defaultRate") || 1),
    });
  revalidateAll();
}
export async function updateIncomeSource(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id)
    await getDb()
      .update(s.incomeSources)
      .set({
        name: str(fd, "name"),
        currency: str(fd, "currency") || "EGP",
        defaultAmount: String(num(fd, "defaultAmount")),
        defaultRate: String(num(fd, "defaultRate") || 1),
      })
      .where(eq(s.incomeSources.id, id));
  revalidateAll();
}
export async function deleteIncomeSource(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().delete(s.incomeSources).where(eq(s.incomeSources.id, id));
  revalidateAll();
}

// ---------- وجهات الاستثمار ----------
export async function addInvestmentDestination(fd: FormData) {
  const name = str(fd, "name");
  const pct = str(fd, "percentage");
  const target = str(fd, "targetAmount");
  if (name)
    await getDb().insert(s.investmentDestinations).values({
      name,
      percentage: pct ? String(num(fd, "percentage") / 100) : null,
      targetAmount: target ? String(num(fd, "targetAmount")) : null,
    });
  revalidateAll();
}
export async function updateInvestmentDestination(fd: FormData) {
  const id = intOrNull(fd, "id");
  const pct = str(fd, "percentage");
  const target = str(fd, "targetAmount");
  if (id)
    await getDb()
      .update(s.investmentDestinations)
      .set({
        name: str(fd, "name"),
        percentage: pct ? String(num(fd, "percentage") / 100) : null,
        targetAmount: target ? String(num(fd, "targetAmount")) : null,
      })
      .where(eq(s.investmentDestinations.id, id));
  revalidateAll();
}
export async function deleteInvestmentDestination(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().delete(s.investmentDestinations).where(eq(s.investmentDestinations.id, id));
  revalidateAll();
}

// ---------- بنود المصروفات المخطّطة ----------
export async function addPlannedExpense(fd: FormData) {
  const label = str(fd, "label");
  if (label)
    await getDb().insert(s.plannedExpenses).values({
      label,
      personId: intOrNull(fd, "personId"),
      categoryId: intOrNull(fd, "categoryId"),
      amountEgp: String(num(fd, "amountEgp")),
    });
  revalidateAll();
}
export async function updatePlannedExpense(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id)
    await getDb()
      .update(s.plannedExpenses)
      .set({
        label: str(fd, "label"),
        personId: intOrNull(fd, "personId"),
        categoryId: intOrNull(fd, "categoryId"),
        amountEgp: String(num(fd, "amountEgp")),
      })
      .where(eq(s.plannedExpenses.id, id));
  revalidateAll();
}
export async function deletePlannedExpense(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (id) await getDb().delete(s.plannedExpenses).where(eq(s.plannedExpenses.id, id));
  revalidateAll();
}

// ---------- عمليات الدخل ----------
export async function addIncomeEntry(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await ensureYear(year);
  await getDb().insert(s.incomeEntries).values({
    year,
    month,
    sourceId: intOrNull(fd, "sourceId"),
    label: str(fd, "label"),
    currency,
    originalAmount: String(original),
    rate: String(rate),
    amountEgp: String(computeEgp(original, rate)),
    occurredOn: dateOrNull(fd, "occurredOn"),
    note: str(fd, "note"),
    isAdhoc: str(fd, "sourceId") ? false : true,
  });
  revalidateMonth(year, month);
}
export async function updateIncomeEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (!id) return;
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await getDb()
    .update(s.incomeEntries)
    .set({
      label: str(fd, "label"),
      currency,
      originalAmount: String(original),
      rate: String(rate),
      amountEgp: String(computeEgp(original, rate)),
      occurredOn: dateOrNull(fd, "occurredOn"),
      note: str(fd, "note"),
    })
    .where(eq(s.incomeEntries.id, id));
  revalidateMonth(year, month);
}
export async function deleteIncomeEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  if (id) await getDb().delete(s.incomeEntries).where(eq(s.incomeEntries.id, id));
  revalidateMonth(year, month);
}

// ---------- عمليات المصروفات ----------
export async function addExpenseEntry(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await ensureYear(year);
  await getDb().insert(s.expenseEntries).values({
    year,
    month,
    categoryId: intOrNull(fd, "categoryId"),
    personId: intOrNull(fd, "personId"),
    label: str(fd, "label"),
    currency,
    originalAmount: String(original),
    rate: String(rate),
    amountEgp: String(computeEgp(original, rate)),
    occurredOn: dateOrNull(fd, "occurredOn"),
    note: str(fd, "note"),
  });
  revalidateMonth(year, month);
}
export async function updateExpenseEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (!id) return;
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await getDb()
    .update(s.expenseEntries)
    .set({
      categoryId: intOrNull(fd, "categoryId"),
      personId: intOrNull(fd, "personId"),
      label: str(fd, "label"),
      currency,
      originalAmount: String(original),
      rate: String(rate),
      amountEgp: String(computeEgp(original, rate)),
      occurredOn: dateOrNull(fd, "occurredOn"),
      note: str(fd, "note"),
    })
    .where(eq(s.expenseEntries.id, id));
  revalidateMonth(year, month);
}
export async function deleteExpenseEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  if (id) await getDb().delete(s.expenseEntries).where(eq(s.expenseEntries.id, id));
  revalidateMonth(year, month);
}

// ---------- عمليات الاستثمار ----------
export async function addInvestmentEntry(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await ensureYear(year);
  await getDb().insert(s.investmentEntries).values({
    year,
    month,
    destinationId: intOrNull(fd, "destinationId"),
    label: str(fd, "label"),
    currency,
    originalAmount: String(original),
    rate: String(rate),
    amountEgp: String(computeEgp(original, rate)),
    occurredOn: dateOrNull(fd, "occurredOn"),
    note: str(fd, "note"),
  });
  revalidateMonth(year, month);
}
export async function updateInvestmentEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  if (!id) return;
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  const currency = str(fd, "currency") || "EGP";
  const original = num(fd, "originalAmount");
  const rate = currency === "EGP" ? 1 : num(fd, "rate") || 1;
  await getDb()
    .update(s.investmentEntries)
    .set({
      destinationId: intOrNull(fd, "destinationId"),
      label: str(fd, "label"),
      currency,
      originalAmount: String(original),
      rate: String(rate),
      amountEgp: String(computeEgp(original, rate)),
      occurredOn: dateOrNull(fd, "occurredOn"),
      note: str(fd, "note"),
    })
    .where(eq(s.investmentEntries.id, id));
  revalidateMonth(year, month);
}
export async function deleteInvestmentEntry(fd: FormData) {
  const id = intOrNull(fd, "id");
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  if (id) await getDb().delete(s.investmentEntries).where(eq(s.investmentEntries.id, id));
  revalidateMonth(year, month);
}

// ---------- توليد الدخل الثابت لشهر ----------
export async function generateRecurringIncome(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return;
  const db = getDb();
  await ensureYear(year);
  const sources = await db.select().from(s.incomeSources).where(eq(s.incomeSources.active, true));
  const existing = await db
    .select({ sourceId: s.incomeEntries.sourceId })
    .from(s.incomeEntries)
    .where(and(eq(s.incomeEntries.year, year), eq(s.incomeEntries.month, month)));
  const existingIds = new Set(existing.map((e) => e.sourceId));
  const toInsert = sources
    .filter((src) => !existingIds.has(src.id))
    .map((src) => {
      const original = toNum(src.defaultAmount);
      const rate = src.currency === "EGP" ? 1 : toNum(src.defaultRate) || 1;
      return {
        year,
        month,
        sourceId: src.id,
        label: src.name,
        currency: src.currency,
        originalAmount: String(original),
        rate: String(rate),
        amountEgp: String(computeEgp(original, rate)),
        isAdhoc: false,
      };
    });
  if (toInsert.length) await db.insert(s.incomeEntries).values(toInsert);
  revalidateMonth(year, month);
}

// ---------- توليد المصروف الثابت لشهر (من بنود المصروفات المخطّطة) ----------
export async function generateRecurringExpenses(fd: FormData) {
  const year = parseInt(str(fd, "year"), 10);
  const month = parseInt(str(fd, "month"), 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return;
  const db = getDb();
  await ensureYear(year);
  const planned = await db.select().from(s.plannedExpenses);
  const existing = await db
    .select({ label: s.expenseEntries.label })
    .from(s.expenseEntries)
    .where(and(eq(s.expenseEntries.year, year), eq(s.expenseEntries.month, month)));
  const existingLabels = new Set(existing.map((e) => (e.label || "").trim()).filter(Boolean));
  const toInsert = planned
    .filter((p) => !existingLabels.has((p.label || "").trim()))
    .map((p) => {
      const amount = toNum(p.amountEgp);
      return {
        year,
        month,
        categoryId: p.categoryId,
        personId: p.personId,
        label: p.label,
        currency: "EGP",
        originalAmount: String(amount),
        rate: "1",
        amountEgp: String(amount),
      };
    });
  if (toInsert.length) await db.insert(s.expenseEntries).values(toInsert);
  revalidateMonth(year, month);
}

// ---------- تحميل التصنيفات الافتراضية ----------
export async function loadDefaults() {
  const db = getDb();
  const [p, c, src, dst] = await Promise.all([
    db.select().from(s.people).limit(1),
    db.select().from(s.categories).limit(1),
    db.select().from(s.incomeSources).limit(1),
    db.select().from(s.investmentDestinations).limit(1),
  ]);
  if (!p.length)
    await db.insert(s.people).values(DEFAULT_PEOPLE.map((name, i) => ({ name, sortOrder: i })));
  if (!c.length)
    await db.insert(s.categories).values(DEFAULT_CATEGORIES.map((name, i) => ({ name, sortOrder: i })));
  if (!src.length)
    await db.insert(s.incomeSources).values(
      DEFAULT_INCOME_SOURCES.map((x, i) => ({
        name: x.name,
        currency: x.currency,
        defaultAmount: String(x.defaultAmount),
        defaultRate: String(x.defaultRate),
        sortOrder: i,
      }))
    );
  if (!dst.length)
    await db.insert(s.investmentDestinations).values(
      DEFAULT_INVESTMENT_DESTINATIONS.map((x, i) => ({
        name: x.name,
        percentage: x.percentage === null ? null : String(x.percentage),
        targetAmount: x.targetAmount === null ? null : String(x.targetAmount),
        sortOrder: i,
      }))
    );
  revalidateAll();
}
