# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**STRUCTURAL: kept** — priority signal 2 (communication). The sound-emission
bonus (nodling.js) rewarded calling near food/a predator regardless of
frequency, so nothing pushed the emitter toward a *consistent* convention.
Made the bonus bigger when frequency also distinguishes the two cases
(freq > 0.5 near a predator, freq < 0.5 on food; 0.35 vs 0.1), so evolution
is pressured to pick a stable alarm/food-call mapping rather than just
calling near anything that matters.

Before (day 51.7): population 250, fitness 4989, built 647.
After (day 61.7, 16000 validation ticks): population 250, fitness 6134,
built 443. Guardrails: pass (no population/fitness drop vs baseline).
