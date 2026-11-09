import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// أسعار العملات الافتراضية + إعدادات عامة (صف واحد)
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  siteTitle: text("site_title").notNull().default("تخطيط الدخل"),
  rateSar: numeric("rate_sar", { precision: 14, scale: 6 }).notNull().default("13.6"),
  rateUsd: numeric("rate_usd", { precision: 14, scale: 6 }).notNull().default("50"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// السنوات المضافة (عشان نقدر نضيف سنة فاضية)
export const years = pgTable("years", {
  year: integer("year").primaryKey(),
});

// الأشخاص / المستفيدين (البيت، يارا، محمد، عبدالله، أحمد...)
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// أنواع المصروفات (فواتير، دروس، كلية، علاج، مصاريف شخصية...)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// مصادر الدخل الثابتة (قوالب تتكرر كل شهر)
export const incomeSources = pgTable("income_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EGP"), // EGP | SAR | USD
  defaultAmount: numeric("default_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  defaultRate: numeric("default_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

// وجهات الاستثمار / توزيع الفائض (يحددها المستخدم: اسم + نسبة اختيارية + هدف اختياري)
export const investmentDestinations = pgTable("investment_destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  percentage: numeric("percentage", { precision: 7, scale: 4 }), // نسبة من الفائض (اختياري) مثلاً 0.4
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }), // هدف تراكمي (اختياري)
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// بنود المصروفات المخطّطة (الخطة الشهرية الثابتة) — للمقارنة بالفعلي
export const plannedExpenses = pgTable("planned_expenses", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  personId: integer("person_id"),
  categoryId: integer("category_id"),
  amountEgp: numeric("amount_egp", { precision: 14, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ===== العمليات الفعلية =====

export const incomeEntries = pgTable("income_entries", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1..12
  sourceId: integer("source_id"),
  label: text("label").notNull().default(""),
  currency: text("currency").notNull().default("EGP"),
  originalAmount: numeric("original_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  rate: numeric("rate", { precision: 14, scale: 6 }).notNull().default("1"),
  amountEgp: numeric("amount_egp", { precision: 14, scale: 2 }).notNull().default("0"),
  occurredOn: date("occurred_on"),
  note: text("note").default(""),
  isAdhoc: boolean("is_adhoc").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const expenseEntries = pgTable("expense_entries", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  categoryId: integer("category_id"),
  personId: integer("person_id"),
  label: text("label").notNull().default(""),
  currency: text("currency").notNull().default("EGP"),
  originalAmount: numeric("original_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  rate: numeric("rate", { precision: 14, scale: 6 }).notNull().default("1"),
  amountEgp: numeric("amount_egp", { precision: 14, scale: 2 }).notNull().default("0"),
  occurredOn: date("occurred_on"),
  note: text("note").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const investmentEntries = pgTable("investment_entries", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  destinationId: integer("destination_id"),
  label: text("label").notNull().default(""),
  currency: text("currency").notNull().default("EGP"),
  originalAmount: numeric("original_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  rate: numeric("rate", { precision: 14, scale: 6 }).notNull().default("1"),
  amountEgp: numeric("amount_egp", { precision: 14, scale: 2 }).notNull().default("0"),
  occurredOn: date("occurred_on"),
  note: text("note").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
