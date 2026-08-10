import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalJson, digest } from "../lib/engine/canonical";
import { evaluatePacket, ruleIds, verifyReceipt } from "../lib/engine/control-engine";
import { seedPacket } from "../lib/data/seed";

const first = evaluatePacket(seedPacket);
const second = evaluatePacket(structuredClone(seedPacket));
const firstBytes = canonicalJson(first);
const secondBytes = canonicalJson(second);

if (firstBytes !== secondBytes) {
  throw new Error("DETERMINISM_FAILURE: normalized receipts differ");
}
if (!verifyReceipt(first, seedPacket).valid) {
  throw new Error("RECEIPT_VERIFICATION_FAILURE: clean receipt did not verify");
}
if (first.results.length !== ruleIds.length || first.results.some((result) => result.state !== "PASS")) {
  throw new Error(`CONTROL_FAILURE: clean seed did not pass all ${ruleIds.length} controls`);
}

const fixtureFiles = readdirSync(join(process.cwd(), "fixtures")).filter((name) => name.endsWith(".json"));
const proof = {
  version: "LocalEngineProof.v1",
  sourceState: "UNCOMMITTED_AUTHOR_TREE",
  seedGeneratedAt: seedPacket.generatedAt,
  ruleSetVersion: first.ruleSetVersion,
  normalizedByteLength: Buffer.byteLength(firstBytes),
  firstSha256: digest(firstBytes),
  secondSha256: digest(secondBytes),
  byteIdentical: firstBytes === secondBytes,
  fixtureFiles: fixtureFiles.length,
  expectedFixturePairs: ruleIds.length,
  cleanControls: first.results.length,
  disposition: first.disposition,
  releaseAuthorized: false,
  externalMutation: false,
  receipt: first,
};
const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
const proofFileSha256 = createHash("sha256").update(proofBytes, "utf8").digest("hex");

const releaseReceipt = {
  version: "ReleaseReceipt.v1",
  claimCeiling: "SOTA_CANDIDATE",
  state: "LOCAL_BUILD_PENDING_DISTINCT_REVIEW",
  sourceCommit: "UNKNOWN_UNTIL_AUTHOR_COMMIT",
  pullRequest: "UNKNOWN",
  distinctReview: "PENDING",
  providerProject: "UNKNOWN",
  deploymentId: "UNKNOWN",
  productionUrl: "UNKNOWN",
  anonymousDesktopSmoke: "PENDING",
  anonymousMobileSmoke: "PENDING",
  packageLinked: false,
  applicationSubmitted: false,
  externalMutation: false,
  localEngineProofByteLength: Buffer.byteLength(proofBytes, "utf8"),
  localEngineProofFileSha256: proofFileSha256,
  localEngineProofCanonicalSha256: digest(proof),
};

mkdirSync(join(process.cwd(), "evidence"), { recursive: true });
writeFileSync(join(process.cwd(), "evidence", "local-engine-proof.json"), proofBytes, "utf8");
writeFileSync(join(process.cwd(), "evidence", "release-receipt.json"), `${JSON.stringify(releaseReceipt, null, 2)}\n`, "utf8");

process.stdout.write(
  `${JSON.stringify({
    state: proof.disposition,
    cleanControls: proof.cleanControls,
    fixtureFiles: proof.fixtureFiles,
    byteIdentical: proof.byteIdentical,
    sha256: proof.firstSha256,
    releaseAuthorized: proof.releaseAuthorized,
  })}\n`,
);
