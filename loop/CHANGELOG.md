# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## cycle 5 (day 51 → 61) — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel already has
an emitter-side reward for "informative" calling (`nodling.js`: +bonus when
calling with food underfoot or a predator close), but no communication
trend/milestone has ever appeared in 51+ days of observation log, unlike
lineage-deepening or flocking trends which recur often. That bonus (+0.25) is
weak next to reproduction's bonus of +1, so it likely isn't strong enough to
bootstrap meaningful signalling. Raised the informative-call bonus
`0.25 → 0.5` in `nodling.js` (not in `tunable_params`, hence `STRUCTURAL:`).

**Control check:** re-ran the same 16k-tick validation window from the same
baseline *without* the change to rule out a coincidental population-turnover
event (maxGen crashing 130→~27 happens either way — natural generational
turnover, not caused by this change).

**Before (baseline, day 51.7):** population 250, fitness 5168, maxGen 130, built 626
**After (day 61.7, with change):** population 251, fitness 5887 (+13.9%), maxGen 27, built 363
**Without change (control, day 61.7):** population 247, fitness 5168 (unchanged), maxGen 26, built 323

Guardrails passed (no fitness/population drop). Fitness improved vs. both the
baseline and the no-change control; built count also higher than the control.
Kept. No new communication milestone/trend surfaced yet this cycle — revisit
signal 2 again if none appears after a few more cycles at this bonus level.
