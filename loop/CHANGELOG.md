# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 6 (day 51.7 → 61.7) — STRUCTURAL: kept

**Hypothesis (signal 2, communication):** the sound channel had a reward for
*calling* while food/a predator was nearby (`nodling.js`), but no reward for
a *listener* reacting usefully to a heard sound — so the food-call/alarm-call
correlation had no selection pressure to become learnable, and construction
(signal 1, `built` already at 599, way past the old milestone) plus the
day-1.7→day-51.7 fitness plateau (4196→4218 despite pop 70→238, gen→151,
matching the recurring-plateau pattern RULES.md flags) both pointed at
widening the fitness landscape rather than re-tuning a knob.

**Change:** tag each emitted sound with its ground-truth `kind` (`'danger'`
if a predator was near the caller, `'food'` if it was standing on nutrition,
else none — not exposed as a new sense, just used for reward). A listener
that hears a sound now gets a small bonus/penalty next tick based on whether
its own movement direction aligned with fleeing a `'danger'` call or
approaching a `'food'` call.

**Before → after** (80000-tick batch, then 16000-tick validation):
fitness 4218 → 4691 (+11%, guardrail max drop 25%); population 238 → 251
(guardrail min 15, max drop 40%); built 599 → 417 (still far above the old
`built>=25` milestone). `selfTest()` passed both times. Guardrail script:
`pass: true`.
