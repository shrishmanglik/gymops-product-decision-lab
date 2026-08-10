import { z } from "zod";

export const statusSchema = z.enum([
  "IMPLEMENTED",
  "PROPOSED",
  "HYPOTHESIS",
  "UNKNOWN",
]);

export const signalSchema = z.object({
  id: z.string().min(1),
  sourceClass: z.enum(["support", "usage", "observation", "strategy"]),
  actor: z.enum(["owner", "staff", "member", "multi-site operator"]),
  surface: z.enum([
    "membership",
    "billing",
    "scheduling",
    "attendance",
    "progression",
    "website",
    "communications",
  ]),
  synthetic: z.literal(true),
  observation: z.string().min(1),
  interpretation: z.string().min(1),
  requestedSolution: z.string().min(1).nullable(),
  sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
  capturedAt: z.string().datetime(),
  locale: z.string().min(2),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const workflowSnapshotSchema = z.object({
  id: z.string(),
  version: z.string(),
  capturedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  actors: z.array(z.string()).min(2),
  steps: z.array(z.string()).min(3),
  knownRules: z.array(z.string()).min(1),
  sourceEvidenceIds: z.array(z.string()).min(2),
  affectedSurfaces: z.array(z.string()).min(1),
  unknowns: z.array(z.string()).min(1),
});

export const problemFrameSchema = z.object({
  id: z.string(),
  actor: z.string(),
  job: z.string(),
  observedFailure: z.string(),
  evidenceIds: z.array(z.string()).min(2),
  counterEvidenceIds: z.array(z.string()).min(1),
  frequencyBand: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]),
  severityBand: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]),
  nonGoals: z.array(z.string()).min(1),
  discoveryExpiresAt: z.string().datetime(),
});

export const interventionSchema = z.object({
  id: z.string(),
  name: z.string(),
  hypothesis: z.string(),
  scope: z.array(z.string()).min(1),
  exclusions: z.array(z.string()).min(1),
  dependencies: z.array(z.string()).min(1),
  affectedActors: z.array(z.string()).min(2),
  affectedSurfaces: z.array(z.string()).min(1),
  operationalRisks: z.array(z.string()).min(1),
  reversible: z.boolean(),
  prototypeScenarioIds: z.array(z.string()),
  disposition: z.enum([
    "DO_NOT_BUILD",
    "DISCOVERY_REQUIRED",
    "PROTOTYPE_CANDIDATE",
    "SPEC_READY_FOR_HUMAN_REVIEW",
    "INDETERMINATE",
  ]),
  reasonCodes: z.array(z.string()).min(1),
  evidenceStrength: z.enum(["LOW", "MEDIUM", "HIGH"]),
  userImpact: z.enum(["LOW", "MEDIUM", "HIGH"]),
  strategicFit: z.enum(["LOW", "MEDIUM", "HIGH"]),
  operationalRisk: z.enum(["LOW", "MEDIUM", "HIGH"]),
  effort: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  preconditions: z.array(z.string()).min(1),
  action: z.string(),
  expectedTransition: z.string(),
  failureState: z.string(),
  recoveryAction: z.string(),
});

export const outcomeContractSchema = z.object({
  baseline: z.string(),
  leadingIndicator: z.string(),
  guardrails: z.object({
    member: z.string(),
    operator: z.string(),
    reliability: z.string(),
    support: z.string(),
  }),
  measurementWindow: z.string(),
  stopConditions: z.array(z.string()).min(1),
  rollbackConditions: z.array(z.string()).min(1),
});

export const buildSpecSchema = z.object({
  goal: z.string().min(1),
  scope: z.array(z.string()).min(1),
  nonGoals: z.array(z.string()).min(1),
  currentState: z.array(z.string()).min(1),
  transitions: z.array(z.string()).min(4),
  edgeCases: z.array(z.string()).min(5),
  acceptanceCriteria: z.array(z.string()).min(5),
  instrumentation: z.array(z.string()).min(1),
  rollout: z.array(z.string()).min(1),
  rollback: z.array(z.string()).min(1),
  unknowns: z.array(z.string()).min(1),
});

export const aiReceiptSchema = z.object({
  version: z.literal("AIWorkflowReceipt.v1"),
  permittedEvidenceIds: z.array(z.string()).min(1),
  contextVersion: z.string(),
  workflowVersion: z.string(),
  inputDigest: z.string().regex(/^[a-f0-9]{64}$/),
  outputDigest: z.string().regex(/^[a-f0-9]{64}$/),
  citationCoverage: z.number().min(0).max(1),
  acceptedSuggestions: z.array(z.string()),
  rejectedSuggestions: z.array(z.string()),
  humanReviewDisposition: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
});

export const decisionPacketSchema = z.object({
  version: z.literal("GymOpsDecisionPacket.v1"),
  synthetic: z.literal(true),
  generatedAt: z.string().datetime(),
  signals: z.array(signalSchema).min(3),
  workflow: workflowSnapshotSchema,
  problem: problemFrameSchema,
  interventions: z.array(interventionSchema).length(3),
  scenarios: z.array(scenarioSchema).min(6),
  outcome: outcomeContractSchema,
  spec: buildSpecSchema,
  aiReceipt: aiReceiptSchema,
  releaseReview: z.object({
    actorRole: z.enum(["AUTHOR", "REVIEWER"]),
    distinctSession: z.boolean(),
    disposition: z.enum(["PENDING", "APPROVED", "REVISED", "BLOCKED"]),
  }),
  humanOwnerRequired: z.literal(true),
  externalMutation: z.literal(false),
});

export type DecisionPacket = z.infer<typeof decisionPacketSchema>;
export type OpsSignal = z.infer<typeof signalSchema>;
export type Intervention = z.infer<typeof interventionSchema>;
export type PrototypeScenario = z.infer<typeof scenarioSchema>;
