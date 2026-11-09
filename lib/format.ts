// تنسيق الأرقام بالجنيه المصري

export function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

const egpFormatter = new Intl.NumberFormat("ar-EG", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const egpFormatter2 = new Intl.NumberFormat("ar-EG", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

// صيغة مختصرة للأرقام الكبيرة في العناوين
export function fmtEgp(v: unknown): string {
  const n = toNum(v);
  return egpFormatter.format(Math.round(n));
}

export function fmtEgpExact(v: unknown): string {
  return egpFormatter2.format(toNum(v));
}

export function fmtNumber(v: unknown, digits = 2): string {
  const n = toNum(v);
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n);
}

export function fmtPercent(v: unknown): string {
  const n = toNum(v);
  return new Intl.NumberFormat("ar-EG", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

// حساب المقابل بالجنيه
export function computeEgp(originalAmount: number, rate: number): number {
  return Math.round(originalAmount * rate * 100) / 100;
}
