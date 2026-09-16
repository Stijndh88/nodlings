# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel already
gives an emitter a bonus for calling near food/a predator, and a listener
already senses heard-frequency + direction, but nothing rewards the listener
for *reacting* to it — so alarm→flee / food→approach correlations have no
direct gradient to bootstrap on, only the general wellbeing signal.

**Change:** tag emitted sounds with `food`/`alarm` context (same condition
already used for the emitter's bonus). When a listener hears a tagged sound,
give it a small bonus (+0.15) for moving away from an alarm-tagged source or
toward a food-tagged one, mirroring the emitter's existing reward shape.
`nodling.js`: `lastHeard` field, sound tagging in the emit block, reaction
bonus after `brain.step()`.

**Before → after** (batch day 51.7 → validation day 61.7, 16000 ticks):
population 251 → 249, fitness 5369 → 5451, maxGen 121 → 28 (population
reseed event during the run, per observations.md — pre-existing lineage
churn, not something this change touches), built 661 → 538.

Guardrails passed: no NaN, population well above floor (15), fitness rose
(no drop), population drop 0.8% (max 40%). Kept.
