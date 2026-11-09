"use client";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MONTH_NAMES } from "@/lib/constants";

export function currentYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parse(v: string): { y: number; m: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(v || "");
  if (!match) {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  }
  return { y: Number(match[1]), m: Number(match[2]) };
}

export default function MonthYearPicker({
  value,
  onChange,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
}) {
  const { y, m } = parse(value);
  const nowYear = new Date().getFullYear();
  const years: number[] = [];
  for (let yr = nowYear + 2; yr >= nowYear - 6; yr--) years.push(yr);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <div className="flex gap-2">
        <div className="flex-1">
          <NativeSelect
            aria-label="الشهر"
            value={String(m)}
            onChange={(e) => onChange(`${y}-${pad(Number(e.target.value))}`)}
          >
            {MONTH_NAMES.map((nm, i) => (
              <NativeSelectOption key={i} value={String(i + 1)}>{nm}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="w-28">
          <NativeSelect
            aria-label="السنة"
            className="num"
            value={String(y)}
            onChange={(e) => onChange(`${Number(e.target.value)}-${pad(m)}`)}
          >
            {years.map((yr) => (
              <NativeSelectOption key={yr} value={String(yr)}>{yr}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </>
  );
}
