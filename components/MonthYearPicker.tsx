"use client";

import { Select, Flex } from "@radix-ui/themes";
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
      <Flex gap="2">
        <Select.Root value={String(m)} onValueChange={(v) => onChange(`${y}-${pad(Number(v))}`)}>
          <Select.Trigger style={{ flex: "1 1 auto" }} aria-label="الشهر" />
          <Select.Content>
            {MONTH_NAMES.map((nm, i) => (
              <Select.Item key={i} value={String(i + 1)}>{nm}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Select.Root value={String(y)} onValueChange={(v) => onChange(`${Number(v)}-${pad(m)}`)}>
          <Select.Trigger style={{ width: 96 }} aria-label="السنة" />
          <Select.Content>
            {years.map((yr) => (
              <Select.Item key={yr} value={String(yr)} className="num">{yr}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </>
  );
}
