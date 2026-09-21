# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 61.7 — kept

**Hypothesis** (priority signal 1: multi-step construction / brick-kiln chains):
bricks (17) are a tiny fraction of structures vs bridges (509) because clay
only fires into brick when a wildfire's spread happens to reach a clay
deposit, and fire barely spreads (`0.04`/tick/neighbour). Extracted that
literal into a named `FIRE_SPREAD_RATE` tunable (`world.js`) and raised it
0.04 → 0.07 (within the declared [0.01, 0.2] range) so fires cover more
ground and touch more clay, expecting more brick/kiln activity.

**Before** (day 51.7, pop 250): fitness 6031, maxGen 141, avgBrain 86.5,
built 619.
**After** (day 61.7, pop 252, +16000 ticks): fitness 6031, maxGen 26,
avgBrain 67.4, built 258.

Guardrails passed (no fitness/population drop, no NaN, self-test OK), so
kept per policy. Flagging for a future cycle though: `built` roughly
halved and `maxGen` collapsed 141→26 over just 10 sim-days — consistent
with wider fire spread burning down more standing structures (and possibly
killing an established lineage) faster than the kiln effect adds bricks.
`observations.md` confirms the mixed effect directly: bricks did tick up
17→19, but planks fell 38→18 and bridges collapsed 509→138 — fire is
burning far more than it's firing. Net negative for signal 1's actual goal
(villages/durable structure), even though it's a harmless `kept` by the
guardrail. Next cycle should probably walk `FIRE_SPREAD_RATE` back down
toward 0.04-0.05, or pursue brick production a different way (e.g. let
Nodlings deliberately ignite/tend a kiln instead of relying on wildfire RNG
to reach clay).
