import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

// أسماء متغيّرات شائعة لرابط قاعدة البيانات (Neon/Vercel قد يستخدم أي بادئة)
const PREFERRED_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_POSTGRES_URL",
  "NEON_DATABASE_URL",
  "NEON_POSTGRES_URL",
  "NEON_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

function looksLikePgUrl(v: string | undefined): v is string {
  return !!v && /^postgres(ql)?:\/\//i.test(v);
}

export function resolveDatabaseUrl(): string | undefined {
  // 1) الأسماء المعروفة أولاً
  for (const k of PREFERRED_KEYS) {
    if (looksLikePgUrl(process.env[k])) return process.env[k];
  }
  // 2) أي متغيّر قيمته رابط Postgres (نفضّل المجمّع pooled على unpooled)
  const candidates: { key: string; val: string }[] = [];
  for (const [key, val] of Object.entries(process.env)) {
    if (looksLikePgUrl(val)) candidates.push({ key, val });
  }
  if (candidates.length) {
    const pooled = candidates.find(
      (c) => !/UNPOOLED|NON_POOLING/i.test(c.key)
    );
    return (pooled ?? candidates[0]).val;
  }
  return undefined;
}

export function getDb(): DB {
  if (!_db) {
    const url = resolveDatabaseUrl();
    if (!url) {
      throw new Error(
        "لم يتم العثور على رابط قاعدة البيانات (DATABASE_URL). وصّل قاعدة بيانات Postgres من إعدادات المشروع."
      );
    }
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
