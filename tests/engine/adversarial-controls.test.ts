import { describe, expect, it } from "vitest";
import { seedPacket } from "@/lib/data/seed";
import {
  controlRules,
  evaluatePacket,
  verifyReceipt,
  type ControlRule,
} from "@/lib/engine/control-engine";
import { canonicalJson, digest, sha256 } from "@/lib/engine/canonical";

describe("adversarial control integrity", () => {
  it("accepts the clean seed without authorizing release", () => {
    const receipt = evaluatePacket(seedPacket);
    expect(receipt.results).toHaveLength(11);
    expect(receipt.results.every((result) => result.state === "PASS")).toBe(true);
    expect(receipt.disposition).toBe("SPEC_READY_FOR_HUMAN_REVIEW");
    expect(receipt.releaseAuthorized).toBe(false);
    expect(receipt.externalMutation).toBe(false);
  });

  it("becomes indeterminate when a rule is removed", () => {
    const receipt = evaluatePacket(seedPacket, controlRules.filter((rule) => rule.id !== "GO-R04"));
    expect(receipt.results.find((result) => result.id === "GO-R04")?.code).toBe("RULE_IMPLEMENTATION_MISSING");
    expect(receipt.disposition).toBe("INDETERMINATE");
  });

  it("becomes indeterminate when an evaluator is disabled", () => {
    const registry = controlRules.map((rule) => rule.id === "GO-R06" ? { ...rule, evaluate: undefined } : rule);
    const receipt = evaluatePacket(seedPacket, registry);
    expect(receipt.results.find((result) => result.id === "GO-R06")?.code).toBe("RULE_IMPLEMENTATION_MISSING");
  });

  it("rejects a substituted issue code", () => {
    const registry: ControlRule[] = controlRules.map((rule) =>
      rule.id === "GO-R07" ? { ...rule, failCode: "GENERIC_PRIORITY_FAILURE" } : rule,
    );
    const receipt = evaluatePacket(seedPacket, registry);
    expect(receipt.results.find((result) => result.id === "GO-R07")?.code).toBe("EVALUATOR_CONTRACT_BREACH");
  });

  it("detects a corrupted evidence digest", () => {
    const packet = structuredClone(seedPacket);
    packet.signals[1].sourceDigest = "f".repeat(64);
    const result = evaluatePacket(packet).results.find((item) => item.id === "GO-R01");
    expect(result?.code).toBe("UNSOURCED_OR_UNLABELLED_SIGNAL");
  });

  it("refuses builder self-approval", () => {
    const packet = structuredClone(seedPacket);
    packet.releaseReview = { actorRole: "AUTHOR", distinctSession: false, disposition: "APPROVED" };
    const result = evaluatePacket(packet).results.find((item) => item.id === "GO-R11");
    expect(result?.code).toBe("AI_ACCOUNTABILITY_BREACH");
  });

  it("refuses stale receipt replay", () => {
    const receipt = evaluatePacket(seedPacket);
    const changed = structuredClone(seedPacket);
    changed.problem.severityBand = "HIGH";
    expect(verifyReceipt(receipt, changed)).toEqual({ valid: false, code: "STALE_RECEIPT_REPLAY" });
  });

  it("refuses a forged control digest", () => {
    const receipt = evaluatePacket(seedPacket);
    receipt.results[0].summary = "Forged summary";
    expect(verifyReceipt(receipt, seedPacket)).toEqual({ valid: false, code: "CONTROL_DIGEST_MISMATCH" });
  });

  it("rejects an international rule inferred from one locale", () => {
    const packet = structuredClone(seedPacket);
    packet.workflow.knownRules.push("One locale communication rule applies internationally.");
    const result = evaluatePacket(packet).results.find((item) => item.id === "GO-R02");
    expect(result?.code).toBe("WORKFLOW_SNAPSHOT_INVALID");
  });

  it("produces byte-identical normalized receipts twice", () => {
    const first = canonicalJson(evaluatePacket(seedPacket));
    const second = canonicalJson(evaluatePacket(structuredClone(seedPacket)));
    expect(first).toBe(second);
    expect(digest(first)).toBe(digest(second));
  });

  it("matches the canonical SHA-256 test vector", () => {
    expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
