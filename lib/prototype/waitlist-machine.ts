import { digest } from "@/lib/engine/canonical";

export type Member = {
  id: string;
  label: string;
  eligible: boolean;
  communicationPermission: boolean;
};

export type WaitlistStatus =
  | "FULL"
  | "PLACE_AVAILABLE"
  | "OFFER_ACTIVE"
  | "RESERVED"
  | "EXPIRED"
  | "BLOCKED_INELIGIBLE"
  | "BLOCKED_PERMISSION"
  | "BLOCKED_FULL"
  | "BLOCKED_PAUSED"
  | "QUEUE_EXHAUSTED";

export type WaitlistEvent = {
  sequence: number;
  action: string;
  from: WaitlistStatus;
  to: WaitlistStatus;
  reason: string;
  atMinute: number;
  memberId: string | null;
  externalMutation: false;
};

export type WaitlistState = {
  scenario: ScenarioId;
  capacity: number;
  booked: number;
  nowMinute: number;
  offerWindowMinutes: number;
  paused: boolean;
  queue: Member[];
  cursor: number;
  activeOffer: { memberId: string; expiresAtMinute: number; token: string } | null;
  status: WaitlistStatus;
  events: WaitlistEvent[];
};

export type ScenarioId = "happy" | "expiry" | "ineligible" | "no-permission" | "full" | "paused";

const baseMembers: Member[] = [
  { id: "SYN-M01", label: "Member A", eligible: true, communicationPermission: true },
  { id: "SYN-M02", label: "Member B", eligible: true, communicationPermission: true },
  { id: "SYN-M03", label: "Member C", eligible: true, communicationPermission: true },
];

export function createScenario(id: ScenarioId): WaitlistState {
  const seed: WaitlistState = {
    scenario: id,
    capacity: 12,
    booked: 12,
    nowMinute: 0,
    offerWindowMinutes: 10,
    paused: false,
    queue: baseMembers.map((member) => ({ ...member })),
    cursor: 0,
    activeOffer: null,
    status: "FULL",
    events: [],
  };
  if (id === "ineligible") seed.queue[0].eligible = false;
  if (id === "no-permission") seed.queue[0].communicationPermission = false;
  if (id === "paused") seed.paused = true;
  return seed;
}

function append(
  state: WaitlistState,
  action: string,
  to: WaitlistStatus,
  reason: string,
  memberId: string | null = null,
): WaitlistState {
  const event: WaitlistEvent = {
    sequence: state.events.length + 1,
    action,
    from: state.status,
    to,
    reason,
    atMinute: state.nowMinute,
    memberId,
    externalMutation: false,
  };
  return { ...state, status: to, events: [...state.events, event] };
}

export function cancelPlace(state: WaitlistState): WaitlistState {
  if (state.booked < state.capacity) {
    return append(state, "CANCEL_PLACE", state.status, "NO_BOOKED_PLACE_TO_RELEASE");
  }
  const next = { ...state, booked: state.booked - 1 };
  return append(next, "CANCEL_PLACE", "PLACE_AVAILABLE", "ONE_PLACE_RELEASED");
}

export function issueNextOffer(state: WaitlistState): WaitlistState {
  if (state.paused) return append(state, "ISSUE_OFFER", "BLOCKED_PAUSED", "STAFF_PAUSE_ACTIVE");
  if (state.booked >= state.capacity) return append(state, "ISSUE_OFFER", "BLOCKED_FULL", "NO_AVAILABLE_CAPACITY");
  const member = state.queue[state.cursor];
  if (!member) return append(state, "ISSUE_OFFER", "QUEUE_EXHAUSTED", "NO_MEMBER_REMAINS");
  if (!member.eligible) return append(state, "ISSUE_OFFER", "BLOCKED_INELIGIBLE", "MEMBERSHIP_RESTRICTION", member.id);
  if (!member.communicationPermission) {
    return append(state, "ISSUE_OFFER", "BLOCKED_PERMISSION", "COMMUNICATION_PERMISSION_ABSENT", member.id);
  }
  const token = digest({ memberId: member.id, cursor: state.cursor, issuedAtMinute: state.nowMinute }).slice(0, 16);
  const next = {
    ...state,
    activeOffer: {
      memberId: member.id,
      expiresAtMinute: state.nowMinute + state.offerWindowMinutes,
      token,
    },
  };
  return append(next, "ISSUE_OFFER", "OFFER_ACTIVE", "ELIGIBLE_BOUNDED_OFFER", member.id);
}

export function acceptOffer(state: WaitlistState, token?: string): WaitlistState {
  const offer = state.activeOffer;
  if (!offer) return append(state, "ACCEPT_OFFER", state.status, "NO_ACTIVE_OFFER");
  if (state.nowMinute >= offer.expiresAtMinute) {
    return append({ ...state, activeOffer: null }, "ACCEPT_OFFER", "EXPIRED", "OFFER_ALREADY_EXPIRED", offer.memberId);
  }
  if (token && token !== offer.token) {
    return append(state, "ACCEPT_OFFER", state.status, "STALE_OR_WRONG_OFFER_TOKEN", offer.memberId);
  }
  if (state.booked >= state.capacity) {
    return append(state, "ACCEPT_OFFER", "BLOCKED_FULL", "CAPACITY_CHANGED_BEFORE_ACCEPTANCE", offer.memberId);
  }
  const next = { ...state, booked: state.booked + 1, activeOffer: null };
  return append(next, "ACCEPT_OFFER", "RESERVED", "ACTIVE_OFFER_RESERVED", offer.memberId);
}

export function advanceTime(state: WaitlistState, minutes: number): WaitlistState {
  const advanced = { ...state, nowMinute: state.nowMinute + minutes };
  if (!advanced.activeOffer || advanced.nowMinute < advanced.activeOffer.expiresAtMinute) {
    return append(advanced, "ADVANCE_TIME", advanced.status, "CLOCK_ADVANCED");
  }
  const expiredMember = advanced.activeOffer.memberId;
  const expired = append(
    { ...advanced, activeOffer: null, cursor: advanced.cursor + 1 },
    "ADVANCE_TIME",
    "EXPIRED",
    "OFFER_WINDOW_ELAPSED",
    expiredMember,
  );
  return issueNextOffer(expired);
}

export function skipBlockedMember(state: WaitlistState): WaitlistState {
  if (!state.status.startsWith("BLOCKED_")) return state;
  const next = append(
    { ...state, cursor: state.cursor + 1 },
    "STAFF_SKIP_BLOCKED",
    "PLACE_AVAILABLE",
    "BLOCK_RECORDED_AND_MEMBER_SKIPPED",
    state.queue[state.cursor]?.id ?? null,
  );
  return issueNextOffer(next);
}

export function setPaused(state: WaitlistState, paused: boolean): WaitlistState {
  const next = { ...state, paused };
  return append(
    next,
    paused ? "PAUSE" : "RESUME",
    paused ? "BLOCKED_PAUSED" : state.booked < state.capacity ? "PLACE_AVAILABLE" : "FULL",
    paused ? "STAFF_PAUSE_ACTIVE" : "STAFF_RESUMED",
  );
}

export function runPrimaryStep(state: WaitlistState): WaitlistState {
  if (state.status === "FULL" && state.scenario !== "full") return issueNextOffer(cancelPlace(state));
  if (state.status === "FULL" && state.scenario === "full") return issueNextOffer(state);
  if (state.status === "PLACE_AVAILABLE") return issueNextOffer(state);
  if (state.status === "OFFER_ACTIVE" && state.scenario === "expiry") return advanceTime(state, 11);
  if (state.status === "OFFER_ACTIVE") return acceptOffer(state);
  if (state.status.startsWith("BLOCKED_") && !state.paused) return skipBlockedMember(state);
  if (state.status === "BLOCKED_PAUSED") return setPaused(state, false);
  return state;
}

export function stateDigest(state: WaitlistState): string {
  return digest(state);
}
