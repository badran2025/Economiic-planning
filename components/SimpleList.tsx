"use client";

import { useRef, useState } from "react";

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
    <section className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>{title}</h3>
      {description && (
        <p className="muted" style={{ margin: "0 0 0.8rem", fontSize: "0.8rem" }}>{description}</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.9rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {items.length === 0 && <li className="muted" style={{ fontSize: "0.85rem" }}>لا يوجد بعد.</li>}
        {items.map((it) =>
          editingId === it.id ? (
            <li key={it.id}>
              <form
                action={async (fd) => {
                  await updateAction(fd);
                  setEditingId(null);
                }}
                style={{ display: "flex", gap: "0.4rem" }}
              >
                <input type="hidden" name="id" value={it.id} />
                <input className="field" name="name" defaultValue={it.name} autoFocus />
                <button className="btn btn-primary" type="submit">حفظ</button>
                <button className="btn" type="button" onClick={() => setEditingId(null)}>إلغاء</button>
              </form>
            </li>
          ) : (
            <li
              key={it.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.45rem 0.7rem",
                background: "var(--surface-2)",
                borderRadius: 8,
              }}
            >
              <span>{it.name}</span>
              <span style={{ display: "flex", gap: "0.1rem" }}>
                <button className="btn btn-ghost" type="button" onClick={() => setEditingId(it.id)} title="تعديل">✎</button>
                <form action={deleteAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={it.id} />
                  <button className="btn btn-danger" type="submit" title="حذف">🗑</button>
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
        style={{ display: "flex", gap: "0.4rem" }}
      >
        <input className="field" name="name" placeholder="إضافة جديد..." required />
        <button className="btn btn-primary" type="submit">+ إضافة</button>
      </form>
    </section>
  );
}
