"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Theme, Container, Flex, Box, Heading, IconButton } from "@radix-ui/themes";
import { Sun, Moon } from "lucide-react";
import Nav from "@/components/Nav";

type Appearance = "light" | "dark";

export default function AppTheme({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>("light");

  useEffect(() => {
    let initial: Appearance = "light";
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") initial = saved;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) initial = "dark";
    } catch {}
    setAppearance(initial);
  }, []);

  function toggle() {
    setAppearance((a) => {
      const next: Appearance = a === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  }

  return (
    <Theme appearance={appearance} accentColor="indigo" grayColor="slate" radius="large" scaling="100%">
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
                  <span style={{ color: "var(--accent-11)", fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                    $
                  </span>
                  <Heading size="4" style={{ color: "var(--gray-12)" }}>
                    Money Management
                  </Heading>
                </Flex>
              </Link>
              <Flex align="center" gap="2">
                <Nav />
                <IconButton variant="ghost" color="gray" onClick={toggle} aria-label="تبديل الوضع الليلي">
                  {appearance === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </IconButton>
              </Flex>
            </Flex>
          </Container>
        </header>
      </Box>

      <Container size="4" px="4" py="5" lang="en">
        {children}
      </Container>
    </Theme>
  );
}
