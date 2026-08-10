import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { seedPacket } from "@/lib/data/seed";
import { evaluatePacket, type RuleId } from "@/lib/engine/control-engine";
import type { DecisionPacket } from "@/lib/domain/schema";

type Fixture = {
  ruleId: RuleId;
  case: string;
  mutation: string;
  expectedCode: string;
};

const fixtureDir = join(process.cwd(), "fixtures");
const fixtures = readdirSync(fixtureDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(join(fixtureDir, name), "utf8")) as Fixture);

function mutate(name: string): DecisionPacket {
  const packet = structuredClone(seedPacket);
  const candidate = packet.interventions.find((item) => item.id === "OPTION-TIMED")!;
  const rejected = packet.interventions.find((item) => item.id === "OPTION-OVERBOOK")!;
  switch (name) {
    case "none": break;
    case "tamper-signal-digest": packet.signals[0].sourceDigest = "0".repeat(64); break;
    case "expire-workflow": packet.workflow.expiresAt = packet.generatedAt; break;
    case "erase-problem-frame": packet.problem.observedFailure = "Requested feature."; break;
    case "collapse-evidence-source": packet.problem.evidenceIds = ["SIG-OWNER-01", "SIG-OWNER-01"]; break;
    case "hide-staff-actor": candidate.affectedActors = ["member", "owner"]; break;
    case "omit-membership-surface": candidate.affectedSurfaces = ["scheduling", "attendance", "communications"]; break;
    case "replace-reject-reason": rejected.reasonCodes = ["POPULAR_REQUEST", "LOW_EFFORT"]; break;
    case "replace-edge-cases": packet.spec.edgeCases = ["Slow screen", "Wide screen", "Old browser", "Refresh", "Back navigation"]; break;
    case "invent-baseline": packet.outcome.baseline = "Estimated 20 percent improvement without a source."; break;
    case "remove-reversibility": candidate.reversible = false; break;
    case "lower-citation-coverage": packet.aiReceipt.citationCoverage = 0.5; break;
    default: throw new Error(`Unknown fixture mutation: ${name}`);
  }
  return packet;
}

describe("known-bad and clean fixture pairs", () => {
  it("contains one bad and one clean fixture for every control", () => {
    for (const index of Array.from({ length: 11 }, (_, item) => item + 1)) {
      const id = `GO-R${String(index).padStart(2, "0")}`;
      expect(fixtures.filter((fixture) => fixture.ruleId === id && fixture.mutation === "none")).toHaveLength(1);
      expect(fixtures.filter((fixture) => fixture.ruleId === id && fixture.mutation !== "none")).toHaveLength(1);
    }
  });

  for (const fixture of fixtures) {
    it(`${fixture.case} returns its exact reason contract`, () => {
      const receipt = evaluatePacket(mutate(fixture.mutation));
      const target = receipt.results.find((result) => result.id === fixture.ruleId);
      expect(target?.code).toBe(fixture.expectedCode);
      expect(target?.state).toBe(fixture.mutation === "none" ? "PASS" : "FAIL");
    });
  }
});
