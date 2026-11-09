import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
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
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0.85rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                textDecoration: "none",
                color: "var(--text)",
                fontWeight: 800,
                fontSize: "1.1rem",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "var(--brand)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.1rem",
                }}
              >
                ₤
              </span>
              تخطيط الدخل
            </Link>
            <nav style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/" className="btn btn-ghost">
                الرئيسية
              </Link>
              <Link href="/settings" className="btn btn-ghost">
                الإعدادات
              </Link>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1.25rem 1rem 4rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
