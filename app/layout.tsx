import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "react-day-picker/style.css";
import "./globals.css";
import AppTheme from "@/components/AppTheme";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Management",
  description: "تنظيم الدخل والمصروفات ومراكز التكلفة والاستثمار — بالجنيه المصري",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body>
        <AppTheme>{children}</AppTheme>
      </body>
    </html>
  );
}
