export const MONTH_NAMES: string[] = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function monthName(m: number): string {
  return MONTH_NAMES[m - 1] ?? String(m);
}

export type CurrencyCode = "EGP" | "SAR" | "USD";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "EGP", label: "جنيه مصري", symbol: "ج.م" },
  { code: "SAR", label: "ريال سعودي", symbol: "ر.س" },
  { code: "USD", label: "دولار أمريكي", symbol: "$" },
];

export function currencyLabel(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}
export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

// تصنيفات افتراضية اختيارية (زر "تحميل التصنيفات الافتراضية")
export const DEFAULT_PEOPLE = [
  "البيت",
  "يارا",
  "محمد",
  "عبدالله",
  "أحمد",
  "علياء",
];

export const DEFAULT_CATEGORIES = [
  "فواتير ومرافق",
  "مصاريف المعيشة",
  "إنترنت",
  "دروس خصوصية",
  "مصاريف دراسية",
  "مصاريف الكلية",
  "علاج",
  "مصاريف شخصية",
  "مناسبات",
  "أخرى",
];

export const DEFAULT_INCOME_SOURCES: {
  name: string;
  currency: CurrencyCode;
  defaultAmount: number;
  defaultRate: number;
}[] = [
  { name: "راتب أحمد (السعودية)", currency: "SAR", defaultAmount: 5500, defaultRate: 13.6 },
  { name: "إيجار الشقة الأولى", currency: "EGP", defaultAmount: 9000, defaultRate: 1 },
  { name: "إيجار شقة الوالدة", currency: "EGP", defaultAmount: 5500, defaultRate: 1 },
  { name: "إيجار المحل", currency: "EGP", defaultAmount: 2500, defaultRate: 1 },
  { name: "المعاش", currency: "EGP", defaultAmount: 4500, defaultRate: 1 },
  { name: "شهادة يارا", currency: "EGP", defaultAmount: 2300, defaultRate: 1 },
];

export const DEFAULT_INVESTMENT_DESTINATIONS: {
  name: string;
  percentage: number | null;
  targetAmount: number | null;
}[] = [
  { name: "صندوق طوارئ الأسرة", percentage: 0.4, targetAmount: 148800 },
  { name: "أدوات منخفضة المخاطر", percentage: 0.3, targetAmount: null },
  { name: "استثمار طويل الأجل متنوع", percentage: 0.2, targetAmount: null },
  { name: "سيولة للأهداف والفرص", percentage: 0.1, targetAmount: null },
];
