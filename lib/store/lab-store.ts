"use client";

import { create } from "zustand";
import { evaluatePacket, type DecisionReceipt } from "@/lib/engine/control-engine";
import { seedPacket } from "@/lib/data/seed";
import {
  createScenario,
  runPrimaryStep,
  setPaused,
  stateDigest,
  type ScenarioId,
  type WaitlistState,
} from "@/lib/prototype/waitlist-machine";

type LabStore = {
  scenario: ScenarioId;
  waitlist: WaitlistState;
  receipt: DecisionReceipt;
  seedStateDigest: string;
  setScenario: (scenario: ScenarioId) => void;
  step: () => void;
  togglePause: () => void;
  reset: () => void;
};

const defaultScenario: ScenarioId = "happy";
const defaultState = createScenario(defaultScenario);

export const useLabStore = create<LabStore>((set) => ({
  scenario: defaultScenario,
  waitlist: defaultState,
  receipt: evaluatePacket(seedPacket),
  seedStateDigest: stateDigest(defaultState),
  setScenario: (scenario) => {
    const waitlist = createScenario(scenario);
    set({ scenario, waitlist, seedStateDigest: stateDigest(waitlist) });
  },
  step: () => set((state) => ({ waitlist: runPrimaryStep(state.waitlist) })),
  togglePause: () => set((state) => ({ waitlist: setPaused(state.waitlist, !state.waitlist.paused) })),
  reset: () => {
    const waitlist = createScenario(defaultScenario);
    set({
      scenario: defaultScenario,
      waitlist,
      seedStateDigest: stateDigest(waitlist),
      receipt: evaluatePacket(seedPacket),
    });
  },
}));
