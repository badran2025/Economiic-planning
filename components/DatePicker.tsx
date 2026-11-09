"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Popover, Button } from "@radix-ui/themes";
import { Calendar } from "lucide-react";

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function parseISO(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return new Date();
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DatePicker({
  value,
  defaultValue,
  onChange,
  name,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  name?: string;
}) {
  const [internal, setInternal] = useState(value ?? defaultValue ?? todayISO());
  const [open, setOpen] = useState(false);
  const current = value ?? internal;
  const selected = parseISO(current);

  function set(v: string) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={current} />}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button
            type="button"
            variant="surface"
            color="gray"
            style={{ width: "100%", justifyContent: "space-between", fontWeight: 500 }}
          >
            <span className="num">{current}</span>
            <Calendar size={16} />
          </Button>
        </Popover.Trigger>
        <Popover.Content dir="ltr" style={{ width: "auto" }}>
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            captionLayout="dropdown"
            onSelect={(d) => {
              if (d) {
                set(fmt(d));
                setOpen(false);
              }
            }}
          />
        </Popover.Content>
      </Popover.Root>
    </>
  );
}
