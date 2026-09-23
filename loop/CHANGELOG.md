# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side reward for reacting to heard sound

Signal 1 (construction) is already far past its `built >= 25` target (599
durable structures at baseline), so moved to signal 2 (communication). The
sound channel already rewarded *callers* for signalling near something that
matters (food/predator), but nothing rewarded *listeners* for reacting to a
heard call — so the receiving end of the channel had no gradient pushing it
toward using sense indices 22-24. Added a symmetric small reward
(`nodling.js`): a Nodling that hears a sound and moves toward it while
hungry, or away from it while a predator is nearby, gets `bonus += 0.15`,
mirroring the existing caller-side bonus.

Baseline (day 51.7, pre-change): population 248, fitness 4688, built 599.
Validation (day 61.7, +16000 ticks): population 251, fitness 4927 (+5.1%),
built 380 (world in winter, structures naturally down). Guardrails passed
(no population/fitness drop). Note: baseline batch itself already showed a
population crash/reseed around day 51.7 (max generation dropped from 132 to
near 0) — pre-existing instability, unrelated to this change; worth a future
cycle looking at `REPRO_THRESHOLD` or reseed logic.
