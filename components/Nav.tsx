"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Flex } from "@radix-ui/themes";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/settings", label: "الإعدادات" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <Flex gap="2" align="center">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Button
            key={l.href}
            asChild
            variant={active ? "soft" : "ghost"}
            color={active ? "indigo" : "gray"}
            size="2"
          >
            <Link href={l.href}>{l.label}</Link>
          </Button>
        );
      })}
    </Flex>
  );
}
