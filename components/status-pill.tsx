import { cn } from "@/lib/utils";

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "neutral" | "info" }) {
  return <span className={cn("status-pill", `status-${tone}`)}>{children}</span>;
}
