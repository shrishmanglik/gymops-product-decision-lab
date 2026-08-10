"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLabStore } from "@/lib/store/lab-store";

const links = [
  { href: "/signals", label: "Signals" },
  { href: "/decision", label: "Decision" },
  { href: "/prototype", label: "Prototype" },
  { href: "/spec", label: "Spec" },
  { href: "/proof", label: "Proof" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const reset = useLabStore((state) => state.reset);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="GymOps Product Decision Lab home">
          <span className="brand-mark" aria-hidden="true">GO</span>
          <span><strong>GymOps</strong><small>Product Decision Lab</small></span>
        </Link>
        <nav aria-label="Primary navigation" className="primary-nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="secondary" size="small" onClick={reset} data-testid="global-reset">
          Reset seed
        </Button>
      </div>
    </header>
  );
}
