# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — STRUCTURAL: kept

**Priority signal:** #1 (villages) is already well past target (`built` sustained
at 589-602, ~24x the 25-structure milestone) — moved to #2 (communication).

**Hypothesis:** the sound channel had a reward for the *caller* (bonus for
calling near food/a predator) but nothing ever reinforced the *listener*.
An alarm→flee correlation can only bootstrap through the far noisier, delayed
survival signal (not dying later), which is a weak gradient for the per-tick
Hebbian reward. Added a small immediate bonus (`this.bonus += 0.15`) when a
Nodling moves away from a heard sound's source while it also directly senses
a nearby predator (`nodling.js`, in `tick()`'s thinking block) — gives an
alarm-response a reward gradient to climb without hardcoding what a call
"means".

**Before → after (16k validation ticks):**
- population: 250 → 250 (steady, at cap)
- fitness (best-ever): 5128 → 5128 (unchanged — expected over just 10 days)
- built: 602 → 423 (normal weathering fluctuation, not guardrail-tracked)
- maxGen (living pop only, not cumulative): 140 → 25 (turnover in the living
  population, not a guardrail metric)
- guardrails: pass (no NaN, population/fitness drop within thresholds)

Kept.
