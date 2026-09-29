# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51→61 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel is only
reinforced on the *caller* side (bonus for emitting while food/predator is
nearby, `nodling.js`) — nothing rewards the *listener* for reacting to a
heard sound, so a caller→listener correlation (alarm→flee, food-found→
approach) has no gradient to evolve toward even if emission itself is
learnable.

**Change**: `nodling.js` — `sense()` now remembers the last heard sound's
offset (`this.heardDir`); `tick()` adds a small listener bonus (+0.15) for
moving away from a heard sound while a predator is nearby, or toward it
while hungry (energy < 50%). Mirrors the existing caller-side bonus
structure; meaning of the frequency itself is still left to evolve.

**Metrics** (batch 80000 ticks → validation 16000 ticks):
| metric | before (day 51.7) | after (day 61.7) |
|---|---|---|
| population | 151 | 250 (cap) |
| fitness | 5263 | 5263 |
| maxGen | 144 | 28 |
| avgBrain | 89.6 | 67.4 |
| built | 839 | 389 |

Guardrail check passed (no fitness/population drop beyond thresholds).
`maxGen` and `avgBrain` dropped, consistent with a population turnover
(die-off + regrowth to cap) within the window — not caught by the declared
guardrails, which only track fitness/population drop and non-finite
metrics. Kept per the mechanical pass/fail contract; flagging here for a
human to review population-turnover as an additional guardrail candidate.
