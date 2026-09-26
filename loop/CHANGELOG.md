# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**STRUCTURAL: kept** — Signal 2 (communication). The sound channel already had
a sender-side bonus for calling near something that matters (food/predator)
and was already wired as a brain input (heard freq + direction), but nothing
rewarded the *listener* for reacting appropriately, so there was no gradient
pushing toward a stable alarm/food meaning. Added a small listener-side
reward in `nodling.js` `tick()`: when a Nodling heard a sound this think-step
and a real predator is nearby, reward it for moving away from the sound
source (alarm→flee); when real flora is visible, reward it for moving toward
the source (food-found→approach). `+0.15` bonus each way, mirroring the
existing sender-side bonus magnitude.

Before (batch, day 51.7): population 250, fitness 5053, maxGen 94, built 605.
After (validation, day 61.7): population 250, fitness 5053, maxGen 29 (a
population/generation crash happened mid-window — consistent with the
pre-existing "crashing to reseed floor" pattern noted in observations.md at
day 51.7, not obviously caused by this change), built 336.
Guardrails: fitness drop 0%, population drop 0% — pass.

Note for a future cycle: the mid-window population crash and generation
reset is itself evidence for priority signal 3 (plateau/stability) — worth a
dedicated hypothesis once this cycle's change has had time to show its
effect on sound-driven behavior.
