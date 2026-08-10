import type { DecisionPacket } from "@/lib/domain/schema";
import { buildSpecSchema, decisionPacketSchema } from "@/lib/domain/schema";
import { digest } from "@/lib/engine/canonical";

export const ruleIds = [
  "GO-R01", "GO-R02", "GO-R03", "GO-R04", "GO-R05", "GO-R06",
  "GO-R07", "GO-R08", "GO-R09", "GO-R10", "GO-R11", "GO-R12",
] as const;

export const ruleSetVersion = "GO-1.1.0" as const;

export type RuleId = (typeof ruleIds)[number];

const ruleContracts: Record<RuleId, { name: string; failCode: string }> = {
  "GO-R01": { name: "Signal truth", failCode: "UNSOURCED_OR_UNLABELLED_SIGNAL" },
  "GO-R02": { name: "Current workflow", failCode: "WORKFLOW_SNAPSHOT_INVALID" },
  "GO-R03": { name: "Problem before solution", failCode: "PROBLEM_FRAME_MISSING" },
  "GO-R04": { name: "Evidence convergence", failCode: "EVIDENCE_NOT_CONVERGENT" },
  "GO-R05": { name: "Actor cost", failCode: "ACTOR_COST_UNASSESSED" },
  "GO-R06": { name: "Surface impact", failCode: "SURFACE_OR_DEPENDENCY_OMITTED" },
  "GO-R07": { name: "Defensible priority", failCode: "PRIORITY_REASON_INCOMPLETE" },
  "GO-R08": { name: "Buildable spec", failCode: "SPEC_CONTRACT_INCOMPLETE" },
  "GO-R09": { name: "Measurement", failCode: "MEASUREMENT_CONTRACT_INCOMPLETE" },
  "GO-R10": { name: "Reversibility", failCode: "REVERSIBILITY_CONTRACT_INCOMPLETE" },
  "GO-R11": { name: "AI accountability", failCode: "AI_ACCOUNTABILITY_BREACH" },
  "GO-R12": { name: "Waitlist transition integrity", failCode: "WAITLIST_TRANSITION_INTEGRITY_BREACH" },
};

export interface RuleEvaluation {
  pass: boolean;
  evidence: string[];
  summary: string;
}

export interface ControlRule {
  id: RuleId;
  failCode: string;
  evaluate?: (packet: DecisionPacket) => RuleEvaluation;
}

function signalPayload(signal: DecisionPacket["signals"][number]) {
  return Object.fromEntries(
    Object.entries(signal).filter(([key]) => !["sourceDigest", "capturedAt", "synthetic"].includes(key)),
  );
}

export const controlRules: ControlRule[] = [
  {
    id: "GO-R01",
    failCode: ruleContracts["GO-R01"].failCode,
    evaluate: (packet) => {
      const valid = packet.signals.every(
        (signal) => signal.synthetic && signal.sourceDigest === digest(signalPayload(signal)),
      );
      return {
        pass: valid,
        evidence: packet.signals.map((signal) => `${signal.id}:${signal.sourceDigest.slice(0, 12)}`),
        summary: valid
          ? "Every signal is explicitly synthetic and its content digest verifies."
          : "At least one signal is unlabelled or its content digest does not verify.",
      };
    },
  },
  {
    id: "GO-R02",
    failCode: ruleContracts["GO-R02"].failCode,
    evaluate: (packet) => {
      const knownIds = new Set(packet.signals.map((item) => item.id));
      const valid =
        packet.workflow.version.length > 0 &&
        packet.workflow.steps.length >= 3 &&
        packet.workflow.sourceEvidenceIds.every((id) => knownIds.has(id)) &&
        new Date(packet.workflow.expiresAt) > new Date(packet.generatedAt) &&
        packet.workflow.unknowns.length > 0 &&
        !packet.workflow.unknowns.some((item) => item.trim().toLowerCase() === "none") &&
        !packet.workflow.knownRules.some((item) => item.toLowerCase().includes("applies internationally"));
      return {
        pass: valid,
        evidence: [packet.workflow.id, packet.workflow.version, packet.workflow.expiresAt],
        summary: valid
          ? "The workflow is versioned, evidence-linked, unexpired, and preserves unknowns."
          : "The workflow snapshot is stale, incomplete, or detached from source evidence.",
      };
    },
  },
  {
    id: "GO-R03",
    failCode: ruleContracts["GO-R03"].failCode,
    evaluate: (packet) => {
      const requested = packet.signals.filter((item) => item.requestedSolution).length;
      const valid =
        requested > 0 &&
        packet.problem.observedFailure.length >= 40 &&
        packet.problem.evidenceIds.length >= 2 &&
        packet.problem.nonGoals.length > 0;
      return {
        pass: valid,
        evidence: [packet.problem.id, ...packet.problem.evidenceIds],
        summary: valid
          ? "Requested solutions resolve to a bounded problem frame with non-goals."
          : "A feature request is being treated as the problem without a supported frame.",
      };
    },
  },
  {
    id: "GO-R04",
    failCode: ruleContracts["GO-R04"].failCode,
    evaluate: (packet) => {
      const signalsById = new Map(packet.signals.map((item) => [item.id, item]));
      const evidence = packet.signals.filter((item) => packet.problem.evidenceIds.includes(item.id));
      const sourceClasses = new Set(evidence.map((item) => item.sourceClass));
      const counterEvidence = packet.problem.counterEvidenceIds.map((id) => signalsById.get(id));
      const counterEvidenceValid =
        new Set(packet.problem.counterEvidenceIds).size === packet.problem.counterEvidenceIds.length &&
        counterEvidence.every((item) => item?.sourceClass === "strategy") &&
        packet.problem.counterEvidenceIds.every((id) => !packet.problem.evidenceIds.includes(id));
      const valid = evidence.length >= 2 && sourceClasses.size >= 2 && counterEvidenceValid;
      return {
        pass: valid,
        evidence: [...sourceClasses, ...packet.problem.counterEvidenceIds],
        summary: valid
          ? "Multiple source classes converge and counterevidence remains visible."
          : "Priority rests on one source class or hides counterevidence.",
      };
    },
  },
  {
    id: "GO-R05",
    failCode: ruleContracts["GO-R05"].failCode,
    evaluate: (packet) => {
      const candidate = packet.interventions.find((item) => item.disposition === "PROTOTYPE_CANDIDATE");
      const valid =
        Boolean(candidate?.affectedActors.includes("member")) &&
        Boolean(candidate?.affectedActors.includes("staff")) &&
        packet.outcome.guardrails.member.length > 0 &&
        packet.outcome.guardrails.operator.length > 0;
      return {
        pass: valid,
        evidence: candidate?.affectedActors ?? [],
        summary: valid
          ? "Member benefit and staff/operator cost are both represented by guardrails."
          : "The intervention hides either member harm or operating cost.",
      };
    },
  },
  {
    id: "GO-R06",
    failCode: ruleContracts["GO-R06"].failCode,
    evaluate: (packet) => {
      const candidate = packet.interventions.find((item) => item.id === "OPTION-TIMED");
      const requiredSurfaces = ["scheduling", "attendance", "membership", "communications"];
      const dependencies = candidate?.dependencies.map((item) => item.toLowerCase()) ?? [];
      const valid =
        requiredSurfaces.every((surface) => candidate?.affectedSurfaces.includes(surface)) &&
        ["membership eligibility", "communication permission", "class capacity", "staff pause"].every(
          (dependency) => dependencies.includes(dependency),
        );
      return {
        pass: valid,
        evidence: [...(candidate?.affectedSurfaces ?? []), ...(candidate?.dependencies ?? [])],
        summary: valid
          ? "All four operating surfaces and their controlling dependencies are named."
          : "An affected surface or controlling dependency is omitted.",
      };
    },
  },
  {
    id: "GO-R07",
    failCode: ruleContracts["GO-R07"].failCode,
    evaluate: (packet) => {
      const dispositions = new Set(packet.interventions.map((item) => item.disposition));
      const required = ["DO_NOT_BUILD", "DISCOVERY_REQUIRED", "PROTOTYPE_CANDIDATE"];
      const rejected = packet.interventions.find((item) => item.disposition === "DO_NOT_BUILD");
      const valid =
        required.every((item) => dispositions.has(item as never)) &&
        packet.interventions.every((item) => item.reasonCodes.length >= 2) &&
        rejected?.reasonCodes.includes("CAPACITY_CONSTRAINT_VIOLATION") === true;
      return {
        pass: valid,
        evidence: packet.interventions.flatMap((item) => [`${item.name}:${item.disposition}`, ...item.reasonCodes]),
        summary: valid
          ? "Build, defer, and reject calls carry option-specific evidence, risk, and capacity reasons."
          : "A disposition lacks an exact say-no, defer, or build reason.",
      };
    },
  },
  {
    id: "GO-R08",
    failCode: ruleContracts["GO-R08"].failCode,
    evaluate: (packet) => {
      const parsed = buildSpecSchema.safeParse(packet.spec);
      const valid =
        parsed.success &&
        packet.spec.transitions.length >= 4 &&
        packet.spec.edgeCases.length >= 5 &&
        packet.spec.acceptanceCriteria.length >= 5 &&
        ["ineligible", "permission", "capacity", "pause", "expiry"].every((term) =>
          packet.spec.edgeCases.some((item) => item.toLowerCase().includes(term)),
        );
      return {
        pass: valid,
        evidence: [
          `${packet.spec.transitions.length} transitions`,
          `${packet.spec.edgeCases.length} edge cases`,
          `${packet.spec.acceptanceCriteria.length} acceptance criteria`,
        ],
        summary: valid
          ? "The spec names goals, exclusions, transitions, edge cases, and acceptance criteria."
          : "Engineering would still need a clarification meeting before implementation.",
      };
    },
  },
  {
    id: "GO-R09",
    failCode: ruleContracts["GO-R09"].failCode,
    evaluate: (packet) => {
      const knownSignalIds = new Set(packet.signals.map((signal) => signal.id));
      const baselineHonest = packet.outcome.baselineState === "UNKNOWN"
        ? /^UNKNOWN(?:\b|:)/.test(packet.outcome.baseline) && packet.outcome.baselineEvidenceIds.length === 0
        : /^SOURCED(?:\b|:)/.test(packet.outcome.baseline) &&
          packet.outcome.baselineEvidenceIds.length > 0 &&
          packet.outcome.baselineEvidenceIds.every((id) => knownSignalIds.has(id));
      const valid =
        baselineHonest &&
        packet.outcome.leadingIndicator.length > 0 &&
        Object.values(packet.outcome.guardrails).every((item) => item.length > 0) &&
        packet.outcome.stopConditions.length >= 2;
      return {
        pass: valid,
        evidence: [
          `baselineState:${packet.outcome.baselineState}`,
          `baselineEvidence:${packet.outcome.baselineEvidenceIds.join(",") || "NONE"}`,
          packet.outcome.baseline,
          packet.outcome.leadingIndicator,
          ...packet.outcome.stopConditions,
        ],
        summary: valid
          ? "The baseline is honest and the outcome contract includes no-harm guardrails."
          : "The measurement plan invents a baseline or omits a guardrail.",
      };
    },
  },
  {
    id: "GO-R10",
    failCode: ruleContracts["GO-R10"].failCode,
    evaluate: (packet) => {
      const candidate = packet.interventions.find((item) => item.disposition === "PROTOTYPE_CANDIDATE");
      const valid =
        candidate?.reversible === true &&
        packet.spec.rollout.length > 0 &&
        packet.spec.rollback.length >= 3 &&
        packet.workflow.knownRules.some((item) => item.toLowerCase().includes("pause")) &&
        packet.outcome.rollbackConditions.length >= 3;
      return {
        pass: valid,
        evidence: [...packet.spec.rollback, ...packet.outcome.rollbackConditions],
        summary: valid
          ? "Pause, staged rollout, rollback triggers, and reconciliation are explicit."
          : "The candidate cannot be safely paused, reversed, and reconciled.",
      };
    },
  },
  {
    id: "GO-R11",
    failCode: ruleContracts["GO-R11"].failCode,
    evaluate: (packet) => {
      const known = new Set(packet.signals.map((item) => item.id));
      const reviewValid =
        packet.releaseReview.disposition === "PENDING" ||
        (packet.releaseReview.actorRole === "REVIEWER" && packet.releaseReview.distinctSession);
      const valid =
        packet.aiReceipt.permittedEvidenceIds.every((id) => known.has(id)) &&
        packet.aiReceipt.citationCoverage === 1 &&
        packet.aiReceipt.rejectedSuggestions.length > 0 &&
        packet.humanOwnerRequired &&
        !packet.externalMutation &&
        reviewValid;
      return {
        pass: valid,
        evidence: [
          `coverage:${packet.aiReceipt.citationCoverage}`,
          `review:${packet.releaseReview.disposition}`,
          `externalMutation:${packet.externalMutation}`,
        ],
        summary: valid
          ? "AI suggestions remain evidence-bound and a distinct human owner still controls release."
          : "AI created evidence, self-approved release, or escaped the no-write boundary.",
      };
    },
  },
  {
    id: "GO-R12",
    failCode: ruleContracts["GO-R12"].failCode,
    evaluate: (packet) => {
      const scenarios = new Map(packet.scenarios.map((scenario) => [scenario.id, scenario]));
      const normalizedAcceptance = packet.spec.acceptanceCriteria.map((criterion) => criterion.toLowerCase());
      const hasAcceptance = (...terms: string[]) =>
        normalizedAcceptance.some((criterion) => terms.every((term) => criterion.includes(term)));
      const expectedTransitions = {
        happy: ["reserved"],
        expiry: ["expired", "next", "offer_active"],
        ineligible: ["blocked_ineligible"],
        "no-permission": ["blocked_permission"],
        full: ["blocked_full"],
        paused: ["blocked_paused"],
        reset: ["seed", "restored"],
      } as const;
      const scenariosValid = Object.entries(expectedTransitions).every(([id, terms]) => {
        const transition = scenarios.get(id)?.expectedTransition.toLowerCase() ?? "";
        return terms.every((term) => transition.includes(term));
      });
      const recoveryTerms = {
        ineligible: ["staff", "resolution"],
        "no-permission": ["hold", "external", "contact"],
        full: ["queue", "unchanged"],
        paused: ["resume", "staff"],
        reset: ["replace", "repository", "seed"],
      } as const;
      const recoveryValid = Object.entries(recoveryTerms).every(([id, terms]) => {
        const recovery = scenarios.get(id)?.recoveryAction.toLowerCase() ?? "";
        return terms.every((term) => recovery.includes(term));
      });
      const acceptanceValid =
        hasAcceptance("above capacity") &&
        hasAcceptance("eligibility", "permission") &&
        hasAcceptance("supplied", "token", "matching", "active", "unexpired", "offer") &&
        hasAcceptance("one", "queue position") &&
        hasAcceptance("pause", "blocks") &&
        hasAcceptance("reset", "seed digest");
      const valid = scenariosValid && recoveryValid && acceptanceValid && packet.externalMutation === false;
      return {
        pass: valid,
        evidence: [
          ...Object.keys(expectedTransitions).map((id) => `${id}:${scenarios.get(id)?.expectedTransition ?? "MISSING"}`),
          `externalMutation:${packet.externalMutation}`,
        ],
        summary: valid
          ? "Capacity, eligibility, permission, active-token, expiry, pause/resume, blocked-member, and exact-reset behavior are explicit and no-write bounded."
          : "The waitlist contract permits an unsafe transition, omits a required blocked path, or escapes the no-write boundary.",
      };
    },
  },
];

export interface ControlResult {
  id: RuleId;
  name: string;
  state: "PASS" | "FAIL" | "INDETERMINATE";
  code: string;
  summary: string;
  evidence: string[];
}

export interface DecisionReceipt {
  version: "GymOpsDecisionReceipt.v1";
  ruleSetVersion: typeof ruleSetVersion;
  inputDigest: string;
  controlDigest: string;
  disposition: "SPEC_READY_FOR_HUMAN_REVIEW" | "INDETERMINATE";
  releaseAuthorized: false;
  externalMutation: false;
  results: ControlResult[];
}

export function evaluatePacket(packetInput: unknown, registry: ControlRule[] = controlRules): DecisionReceipt {
  const parsed = decisionPacketSchema.safeParse(packetInput);
  const inputDigest = digest(packetInput);
  if (!parsed.success) {
    const result: ControlResult = {
      id: "GO-R01",
      name: "Packet schema",
      state: "INDETERMINATE",
      code: "PACKET_SCHEMA_INVALID",
      summary: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
      evidence: [],
    };
    return {
      version: "GymOpsDecisionReceipt.v1",
      ruleSetVersion,
      inputDigest,
      controlDigest: digest([result]),
      disposition: "INDETERMINATE",
      releaseAuthorized: false,
      externalMutation: false,
      results: [result],
    };
  }

  const packet = parsed.data;
  const byId = new Map(registry.map((rule) => [rule.id, rule]));
  const results = ruleIds.map<ControlResult>((id) => {
    const rule = byId.get(id);
    const contract = ruleContracts[id];
    if (!rule || typeof rule.evaluate !== "function") {
      return {
        id,
        name: contract.name,
        state: "INDETERMINATE",
        code: "RULE_IMPLEMENTATION_MISSING",
        summary: `${id} is registered without an executable evaluator.`,
        evidence: [],
      };
    }
    if (rule.failCode !== contract.failCode) {
      return {
        id,
        name: contract.name,
        state: "INDETERMINATE",
        code: "EVALUATOR_CONTRACT_BREACH",
        summary: `${id} returned a failure contract that does not match its canonical reason code.`,
        evidence: [rule.failCode],
      };
    }
    const evaluation = rule.evaluate(packet);
    return {
      id,
      name: contract.name,
      state: evaluation.pass ? "PASS" : "FAIL",
      code: evaluation.pass ? `${id}_PASS` : contract.failCode,
      summary: evaluation.summary,
      evidence: evaluation.evidence,
    };
  });

  const accepted = results.every((result) => result.state === "PASS");
  return {
    version: "GymOpsDecisionReceipt.v1",
    ruleSetVersion,
    inputDigest,
    controlDigest: digest(results),
    disposition: accepted ? "SPEC_READY_FOR_HUMAN_REVIEW" : "INDETERMINATE",
    releaseAuthorized: false,
    externalMutation: false,
    results,
  };
}

export function verifyReceipt(receipt: DecisionReceipt, packetInput: unknown): {
  valid: boolean;
  code: "RECEIPT_CURRENT" | "STALE_RECEIPT_REPLAY" | "CONTROL_DIGEST_MISMATCH";
} {
  if (receipt.inputDigest !== digest(packetInput)) return { valid: false, code: "STALE_RECEIPT_REPLAY" };
  if (receipt.controlDigest !== digest(receipt.results)) return { valid: false, code: "CONTROL_DIGEST_MISMATCH" };
  return { valid: true, code: "RECEIPT_CURRENT" };
}
