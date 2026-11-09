import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تخطيط الدخل",
  description: "موقع تنظيم الدخل والمصروفات ومراكز التكلفة والاستثمار — بالجنيه المصري",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.variable}>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand">
              <span className="brand-badge">₤</span>
              تخطيط الدخل
            </Link>
            <Nav />
          </div>
        </header>
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
