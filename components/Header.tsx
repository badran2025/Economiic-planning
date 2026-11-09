import Link from "next/link";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold leading-none text-primary">$</span>
          <span className="text-lg font-bold tracking-tight">Money Management</span>
        </Link>
        <div className="flex items-center gap-1">
          <Nav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
