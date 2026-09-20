# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sender side already
gets a small reward for calling near food/predators (nodling.js, existing
code), but there was no symmetric reward for a *receiver* reacting to what
it hears — nothing biases the brain toward using the heard-sound sense
inputs (22-24) at all. Added a small receiver-side reward: fleeing (moving
away from) a heard sound while a predator is actually within earshot earns
`+0.15` bonus, mirroring the sender-side heuristic and giving evolution a
gradient toward interpreting sound direction as danger (the "alarm→flee"
case RULES.md calls out). Implementation: `nodling.js` — `sense()` now
stores the nearest heard sound on `this.lastHeard`; `tick()` checks it
against actual predator proximity and movement direction after the move is
applied.

Validation (16000 ticks, `--compare` vs cycle-4 baseline):
- population: 207 → 249
- fitness: 5024 → 5890
- built: 573 → 350
- day: 51.7 → 61.7

No guardrail violations (`pass: true`). Kept.
