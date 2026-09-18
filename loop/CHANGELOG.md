# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51→61.7

STRUCTURAL: kept. Signal 1 (construction) was already far past its target
(`built` 713 at day 51, vs the 25-milestone), so moved to signal 2
(communication): the sound channel had a caller-side bonus for alarm-calling
near a predator but nothing rewarding a *listener* for reacting, so the
alarm→flee correlation had no pressure to become learnable. Added a listener
bonus (`+0.2`) in `nodling.js` `tick()` when a sound is audible (`s[22] > 0`)
and a predator is close (`s[40] > 0.3`) and the chosen move increases
distance from it.

Before (baseline, day 51.7): population 249, fitness 4935, built 713.
After (validation, day 61.7): population 250, fitness 6231, built 470.
Guardrails: pass (no population/fitness drop; population and fitness both
rose). `built` dropped but isn't a guardrailed metric — plausibly normal
day-to-day/seasonal variance, not attributable to this change (it doesn't
touch building/dropping logic).
