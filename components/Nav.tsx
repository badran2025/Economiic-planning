"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/settings", label: "الإعدادات" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Button key={l.href} asChild variant={active ? "secondary" : "ghost"} size="sm">
            <Link href={l.href}>{l.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
