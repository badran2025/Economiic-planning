"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = { id: number; name: string };
type ServerAction = (fd: FormData) => Promise<void>;

export default function SimpleList({
  title,
  description,
  items,
  addAction,
  updateAction,
  deleteAction,
}: {
  title: string;
  description?: string;
  items: Item[];
  addAction: ServerAction;
  updateAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const addRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.length === 0 && <li className="text-sm text-muted-foreground">لا يوجد بعد.</li>}
        {items.map((it) =>
          editingId === it.id ? (
            <li key={it.id}>
              <form
                action={async (fd) => {
                  await updateAction(fd);
                  setEditingId(null);
                }}
                className="flex gap-2"
              >
                <input type="hidden" name="id" value={it.id} />
                <Input name="name" defaultValue={it.name} autoFocus />
                <Button type="submit" size="sm">حفظ</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>إلغاء</Button>
              </form>
            </li>
          ) : (
            <li key={it.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
              <span>{it.name}</span>
              <span className="flex gap-0.5">
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(it.id)} aria-label="تعديل">
                  <Pencil className="size-4" />
                </Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={it.id} />
                  <Button type="submit" variant="ghost" size="icon" className="size-8 text-rose-600 hover:text-rose-600" aria-label="حذف">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </span>
            </li>
          )
        )}
      </ul>

      <form
        ref={addRef}
        action={async (fd) => {
          await addAction(fd);
          addRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <Input name="name" placeholder="إضافة جديد..." required />
        <Button type="submit">+ إضافة</Button>
      </form>
    </Card>
  );
}
