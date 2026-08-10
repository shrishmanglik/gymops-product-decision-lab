import { describe, expect, it } from "vitest";
import {
  acceptOffer,
  advanceTime,
  cancelPlace,
  createScenario,
  issueNextOffer,
  runPrimaryStep,
  setPaused,
  stateDigest,
} from "@/lib/prototype/waitlist-machine";

describe("timed waitlist state machine", () => {
  it("reserves an eligible member before expiry", () => {
    const offered = runPrimaryStep(createScenario("happy"));
    expect(offered.status).toBe("OFFER_ACTIVE");
    const reserved = runPrimaryStep(offered);
    expect(reserved.status).toBe("RESERVED");
    expect(reserved.booked).toBe(reserved.capacity);
    expect(reserved.events.every((event) => event.externalMutation === false)).toBe(true);
  });

  it("refuses acceptance when the current offer token is omitted", () => {
    const offered = issueNextOffer(cancelPlace(createScenario("happy")));
    const result = acceptOffer(offered);
    expect(result.status).toBe("OFFER_ACTIVE");
    expect(result.booked).toBe(11);
    expect(result.activeOffer?.token).toBe(offered.activeOffer?.token);
    expect(result.events.at(-1)?.reason).toBe("OFFER_TOKEN_REQUIRED");
    expect(result.events.at(-1)?.externalMutation).toBe(false);
  });

  it("accepts only the supplied current offer token", () => {
    const offered = issueNextOffer(cancelPlace(createScenario("happy")));
    const result = acceptOffer(offered, offered.activeOffer?.token);
    expect(result.status).toBe("RESERVED");
    expect(result.booked).toBe(12);
    expect(result.activeOffer).toBeNull();
    expect(result.events.at(-1)?.reason).toBe("ACTIVE_OFFER_RESERVED");
    expect(result.events.at(-1)?.externalMutation).toBe(false);
  });

  it("expires one offer and advances exactly one queue position", () => {
    const offered = runPrimaryStep(createScenario("expiry"));
    const advanced = runPrimaryStep(offered);
    expect(advanced.status).toBe("OFFER_ACTIVE");
    expect(advanced.cursor).toBe(1);
    expect(advanced.activeOffer?.memberId).toBe("SYN-M02");
    expect(advanced.events.filter((event) => event.reason === "OFFER_WINDOW_ELAPSED")).toHaveLength(1);
  });

  it("blocks an ineligible member", () => {
    expect(runPrimaryStep(createScenario("ineligible")).status).toBe("BLOCKED_INELIGIBLE");
  });

  it("blocks a member without communication permission", () => {
    expect(runPrimaryStep(createScenario("no-permission")).status).toBe("BLOCKED_PERMISSION");
  });

  it("blocks an offer while capacity remains full", () => {
    expect(runPrimaryStep(createScenario("full")).status).toBe("BLOCKED_FULL");
  });

  it("honors a staff pause and only resumes through an explicit action", () => {
    const blocked = runPrimaryStep(createScenario("paused"));
    expect(blocked.status).toBe("BLOCKED_PAUSED");
    const resumed = setPaused(blocked, false);
    expect(resumed.status).toBe("PLACE_AVAILABLE");
    expect(runPrimaryStep(resumed).status).toBe("OFFER_ACTIVE");
  });

  it("refuses stale and wrong offer tokens", () => {
    const offered = issueNextOffer(cancelPlace(createScenario("happy")));
    const wrong = acceptOffer(offered, "not-the-active-token");
    expect(wrong.status).toBe("OFFER_ACTIVE");
    expect(wrong.booked).toBe(11);
    expect(wrong.events.at(-1)?.reason).toBe("STALE_OR_WRONG_OFFER_TOKEN");
  });

  it("does not accept after expiry", () => {
    const offered = issueNextOffer(cancelPlace(createScenario("happy")));
    const expiredClock = { ...offered, nowMinute: 10 };
    const result = acceptOffer(expiredClock);
    expect(result.status).toBe("EXPIRED");
    expect(result.booked).toBe(11);
  });

  it("never reserves over capacity when capacity changes", () => {
    const offered = issueNextOffer(cancelPlace(createScenario("happy")));
    const externallyFilledSyntheticState = { ...offered, booked: offered.capacity };
    const result = acceptOffer(externallyFilledSyntheticState, offered.activeOffer?.token);
    expect(result.status).toBe("BLOCKED_FULL");
    expect(result.booked).toBe(result.capacity);
  });

  it("restores the exact repository seed", () => {
    const seed = createScenario("happy");
    const changed = advanceTime(runPrimaryStep(seed), 3);
    expect(stateDigest(changed)).not.toBe(stateDigest(seed));
    expect(stateDigest(createScenario("happy"))).toBe(stateDigest(seed));
  });
});
