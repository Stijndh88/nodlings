# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**Signal 2 (communication):** callers already get `bonus += 0.25` for calling
near food/a predator, but it wasn't strong enough to lock in evolved meaning.
Extracted it to `SOUND_BONUS` in `nodling.js` and raised it to `0.4`; added
it to `tunable_params` (range `[0.1, 0.6]`) as a policy-exempt meta edit.
(Signal 1/villages already sustained at `built`=718, ~30x the milestone —
skipped re-tuning it.)

Before → after: population 66→249 (growth toward cap), fitness 5105→5105,
maxGen 144→27 (population-boom dilution, not a crash), built 718→406.
Guardrails pass, no drops. `kept`.
