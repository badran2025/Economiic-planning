import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { Theme, Container, Flex, Box, Heading } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import Nav from "@/components/Nav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تخطيط الدخل",
  description: "تنظيم الدخل والمصروفات ومراكز التكلفة والاستثمار — بالجنيه المصري",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <Theme accentColor="indigo" grayColor="slate" radius="large" scaling="100%">
          <Box
            asChild
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              backdropFilter: "blur(10px)",
              background: "color-mix(in srgb, var(--color-background) 80%, transparent)",
              borderBottom: "1px solid var(--gray-a5)",
            }}
          >
            <header>
              <Container size="4" px="4">
                <Flex align="center" justify="between" py="3" gap="3">
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <Flex align="center" gap="2">
                      <Flex
                        align="center"
                        justify="center"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "var(--radius-3)",
                          background: "var(--accent-9)",
                          color: "var(--accent-contrast)",
                          fontWeight: 800,
                        }}
                      >
                        ₤
                      </Flex>
                      <Heading size="4" style={{ color: "var(--gray-12)" }}>
                        تخطيط الدخل
                      </Heading>
                    </Flex>
                  </Link>
                  <Nav />
                </Flex>
              </Container>
            </header>
          </Box>

          <Container size="4" px="4" py="5">
            {children}
          </Container>
        </Theme>
      </body>
    </html>
  );
}
