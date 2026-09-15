# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel had a
reward for the *emitter* calling near food/a predator (`nodling.js`), but no
reward for a *listener* acting on the heard-frequency sense — so no evolved
frequency could acquire meaning from the listening side. Added a symmetric
listener-side bonus: +0.15 for moving toward a heard sound whose source cell
actually has food, +0.15 for moving away from one near a predator.

**Before** (day 51.7): population 248, fitness 5937, maxGen 87, avgBrain 69.9, built 634
**After** (day 61.7, 16000 ticks): population 250, fitness 5937, maxGen 27, avgBrain 54.2, built 313

No guardrail tripped (fitness/population both stable). `built` and `avgBrain`
dropped but aren't guarded; watch subsequent cycles' observations.md for
whether sound-frequency use vs. nearby food/predator starts correlating.
