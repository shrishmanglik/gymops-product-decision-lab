import Link from "next/link";

const stages = [
  { index: "01", label: "Signals", detail: "Separate what happened from what someone asked for.", href: "/signals" },
  { index: "02", label: "Problem", detail: "Frame the operating failure and preserve counterevidence.", href: "/signals#problem" },
  { index: "03", label: "Intervention", detail: "Build, defer, and reject with explicit reason codes.", href: "/decision" },
  { index: "04", label: "Edge cases", detail: "Operate the bounded workflow and its recovery paths.", href: "/prototype" },
  { index: "05", label: "Measurement", detail: "Ship only with guardrails, rollback, and honest unknowns.", href: "/spec" },
] as const;

export function StageMap() {
  return (
    <ol className="stage-map" aria-label="Signal to specification workflow">
      {stages.map((stage) => (
        <li key={stage.index}>
          <Link href={stage.href}>
            <span className="stage-index">{stage.index}</span>
            <span className="stage-copy"><strong>{stage.label}</strong><small>{stage.detail}</small></span>
            <span className="stage-arrow" aria-hidden="true">↗</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
