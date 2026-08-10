import { PrototypeLab } from "@/components/prototype-lab";
import { RouteHeading } from "@/components/route-heading";
import { StatusPill } from "@/components/status-pill";

export const metadata = { title: "Prototype" };

export default function PrototypePage() {
  return (
    <>
      <RouteHeading
        eyebrow="04 · Functioning workflow"
        title="Make the edge cases operable."
        description="A timed offer is only credible if eligibility, permission, capacity, expiry, staff pause, stale actions, and exact recovery are part of the prototype."
        aside={<><StatusPill tone="good">Local state only</StatusPill><p className="aside-copy">Operate every path. Reset replaces the state from the repository seed.</p></>}
      />
      <div className="content-shell"><PrototypeLab /></div>
    </>
  );
}
