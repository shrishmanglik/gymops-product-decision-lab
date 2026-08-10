import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { digest } from "@/lib/engine/canonical";

describe("release evidence binding", () => {
  it("binds the release receipt to the exact local proof file and its canonical object", () => {
    const proofBytes = readFileSync(join(process.cwd(), "evidence", "local-engine-proof.json"));
    const releaseReceipt = JSON.parse(
      readFileSync(join(process.cwd(), "evidence", "release-receipt.json"), "utf8"),
    ) as {
      localEngineProofByteLength: number;
      localEngineProofFileSha256: string;
      localEngineProofCanonicalSha256: string;
    };
    const proof = JSON.parse(proofBytes.toString("utf8"));

    expect(releaseReceipt.localEngineProofByteLength).toBe(proofBytes.byteLength);
    expect(releaseReceipt.localEngineProofFileSha256).toBe(
      createHash("sha256").update(proofBytes).digest("hex"),
    );
    expect(releaseReceipt.localEngineProofCanonicalSha256).toBe(digest(proof));
  });
});
