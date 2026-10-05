# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51→61 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** sound events lasted exactly
1 tick (`world.sounds = world.nextSounds`), but Nodlings only re-evaluate
their brain every other tick (phase-staggered). A listener's sensing tick
could easily land on the one tick a given call isn't in `world.sounds`,
making the emitter→listener behavioural correlation unreliable to select on
even though the caller-side reward (call near food/predator) already exists.
Extended sound persistence to 2 ticks via `world.prevSounds` (sim.js,
world.js) so every call is guaranteed to overlap at least one listener
evaluation tick, without touching the reward/sensing code itself.

Before (day 51.7, batch_ticks=80000): population 250, fitness 5450, maxGen 131,
avgBrain 84.2, built 729.
After (day 61.7, validation_ticks=16000): population 249, fitness 5450 (0%
drop), maxGen 28, avgBrain 89.4, built 512. Guardrails: pass (no fitness/pop
drop beyond thresholds, no NaN, population well above min 15, selfTest ok).

Kept. maxGen's drop isn't a guardrail metric (it reflects current population's
generation spread, not cumulative lineage depth) and isn't evidence against
this change; watch future cycles' observations.md for sound-emission ↔
nearby-behaviour correlation to see if this actually moves signal 2.
