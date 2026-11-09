import { Card } from "@/components/ui/card";

export function SetupNotice({ detail }: { detail?: string }) {
  return (
    <Card className="mx-auto mt-8 max-w-xl gap-3 p-6">
      <h2 className="text-lg font-bold">الموقع شغّال — لسه قاعدة البيانات مش متوصّلة</h2>
      <p className="text-sm leading-7 text-muted-foreground">
        عشان البيانات تتشارك، محتاجين نوصّل قاعدة بيانات (Postgres). بعد توصيل متغيّر البيئة{" "}
        <code className="rounded bg-muted px-1">DATABASE_URL</code> وتشغيل التهيئة، هيشتغل كل حاجة تلقائياً.
      </p>
      {detail ? (
        <pre dir="ltr" className="overflow-x-auto rounded-md border bg-muted p-3 text-left text-xs">
          {detail}
        </pre>
      ) : null}
    </Card>
  );
}
