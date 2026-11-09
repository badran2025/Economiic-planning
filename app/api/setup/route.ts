import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DDL_STATEMENTS } from "@/lib/db/ddl";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// إنشاء الجداول مرة واحدة بعد توصيل قاعدة البيانات.
// الاستخدام: /api/setup?key=<SETUP_KEY>
// لو ما فيش SETUP_KEY في متغيرات البيئة، يُسمح بالتشغيل بدون مفتاح (للتهيئة الأولى فقط).
export async function GET(request: Request) {
  const expected = process.env.SETUP_KEY;
  const provided = new URL(request.url).searchParams.get("key");
  if (expected && provided !== expected) {
    return NextResponse.json({ ok: false, error: "مفتاح غير صحيح" }, { status: 401 });
  }

  try {
    const db = getDb();
    let created = 0;
    for (const stmt of DDL_STATEMENTS) {
      await db.execute(sql.raw(stmt));
      created++;
    }
    return NextResponse.json({
      ok: true,
      message: `تم تجهيز قاعدة البيانات (${created} جدول).`,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
