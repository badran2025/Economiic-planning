// جُمل إنشاء الجداول (idempotent) — تُنفّذ عبر مسار /api/setup بعد توصيل قاعدة البيانات.
export const DDL_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "expense_entries" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "category_id" integer,
    "person_id" integer,
    "label" text DEFAULT '' NOT NULL,
    "currency" text DEFAULT 'EGP' NOT NULL,
    "original_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
    "rate" numeric(14, 6) DEFAULT '1' NOT NULL,
    "amount_egp" numeric(14, 2) DEFAULT '0' NOT NULL,
    "occurred_on" date,
    "note" text DEFAULT '',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "income_entries" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "source_id" integer,
    "label" text DEFAULT '' NOT NULL,
    "currency" text DEFAULT 'EGP' NOT NULL,
    "original_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
    "rate" numeric(14, 6) DEFAULT '1' NOT NULL,
    "amount_egp" numeric(14, 2) DEFAULT '0' NOT NULL,
    "occurred_on" date,
    "note" text DEFAULT '',
    "is_adhoc" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "income_sources" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "currency" text DEFAULT 'EGP' NOT NULL,
    "default_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
    "default_rate" numeric(14, 6) DEFAULT '1' NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "investment_destinations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "percentage" numeric(7, 4),
    "target_amount" numeric(14, 2),
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "investment_entries" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "destination_id" integer,
    "label" text DEFAULT '' NOT NULL,
    "currency" text DEFAULT 'EGP' NOT NULL,
    "original_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
    "rate" numeric(14, 6) DEFAULT '1' NOT NULL,
    "amount_egp" numeric(14, 2) DEFAULT '0' NOT NULL,
    "occurred_on" date,
    "note" text DEFAULT '',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "people" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "planned_expenses" (
    "id" serial PRIMARY KEY NOT NULL,
    "label" text NOT NULL,
    "person_id" integer,
    "category_id" integer,
    "amount_egp" numeric(14, 2) DEFAULT '0' NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "settings" (
    "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
    "site_title" text DEFAULT 'تخطيط الدخل' NOT NULL,
    "rate_sar" numeric(14, 6) DEFAULT '13.6' NOT NULL,
    "rate_usd" numeric(14, 6) DEFAULT '50' NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "years" (
    "year" integer PRIMARY KEY NOT NULL
  )`,
];
