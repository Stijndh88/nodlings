# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**Hypothesis (signal 2 — communication):** the sound channel already has a
caller-side bonus (`+0.25` wellbeing bonus for calling with food underfoot or
a predator close, `nodling.js`) meant to bootstrap informative signalling,
but RULES.md notes the channel "carries no evolved meaning yet." Priority
signal 1 (construction) is already far past its target (`built` cumulative
707, vs the `built >= 25` milestone) in this run, so moved to signal 2.
Raised the situational call bonus `0.25 → 0.4` to strengthen the
reinforcement for calling when something matters, making the behaviour more
likely to survive selection before frequency-to-situation meaning can
specialize on top of it.

Before (day 51.7): population 75, fitness 4557, maxGen 139, built 707.
After (day 61.7): population 253, fitness 5754, maxGen 26, built 456.
Guardrails: pass (no fitness/population crash vs baseline).

`kept`
