// تشغيل ملفات الـ SQL (DDL) على قاعدة بيانات Neon عبر HTTP — متوافق مع البروكسي.
// الاستخدام: DATABASE_URL="postgres://..." node scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const drizzleDir = join(__dirname, "..", "drizzle");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL مفقود.");
  process.exit(1);
}

const sql = neon(url);

const files = readdirSync(drizzleDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (!files.length) {
  console.error("مفيش ملفات SQL في مجلد drizzle. شغّل: npm run db:generate");
  process.exit(1);
}

let ok = 0;
let skipped = 0;

for (const file of files) {
  const raw = readFileSync(join(drizzleDir, file), "utf8");
  const statements = raw
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/^CREATE TABLE "/i, 'CREATE TABLE IF NOT EXISTS "')
        .replace(/CREATE TABLE "/gi, 'CREATE TABLE IF NOT EXISTS "')
    );

  console.log(`\n▶ ${file} — ${statements.length} عبارة`);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      ok++;
    } catch (e) {
      const msg = String(e?.message || e);
      if (/already exists/i.test(msg)) {
        skipped++;
      } else {
        console.error("✖ خطأ في العبارة:\n", stmt.slice(0, 120), "\n", msg);
        process.exit(1);
      }
    }
  }
}

console.log(`\n✅ تم. نُفّذت ${ok} عبارة، وتم تخطّي ${skipped} (موجودة بالفعل).`);
