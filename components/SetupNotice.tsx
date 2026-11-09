export function SetupNotice({ detail }: { detail?: string }) {
  return (
    <div className="card" style={{ padding: "1.5rem", maxWidth: 620, margin: "2rem auto" }}>
      <h2 style={{ marginTop: 0 }}>الموقع شغّال — لسه قاعدة البيانات مش متوصّلة</h2>
      <p className="muted" style={{ lineHeight: 1.9 }}>
        عشان البيانات تتشارك بينك وبين أخوك بشكل مباشر، محتاجين نوصّل قاعدة بيانات (Postgres).
        بعد توصيل متغيّر البيئة <code>DATABASE_URL</code> وتشغيل التهيئة، هيشتغل كل حاجة تلقائياً.
      </p>
      {detail ? (
        <pre
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "0.75rem",
            overflowX: "auto",
            fontSize: "0.8rem",
            direction: "ltr",
            textAlign: "left",
          }}
        >
          {detail}
        </pre>
      ) : null}
    </div>
  );
}
