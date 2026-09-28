# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Day 61.7 — extend sound persistence to 2 ticks — kept

**Signal:** priority #2, communication. Sounds were cleared every tick
(`world.sounds = world.nextSounds`, replace not merge), so an emission was
audible for exactly 1 world tick. Nodlings only re-evaluate their brain
("think") every other tick (phase-staggered), so roughly half of all
listeners had no chance to ever sense a given emission — no correlation
between a call and an outcome could be learned if the listener never
perceived the call. Added `world.prevSounds`, kept alongside `world.sounds`
in `buildIndex`'s `sIndex`, so a sound stays audible for 2 ticks — matching
every Nodling's think cadence.

Files: `world.js` (+`prevSounds` field, merged into `sIndex`), `sim.js`
(`world.prevSounds = world.sounds` before the existing swap).

Before (day 51.7, 80k-tick batch): population 249, fitness 4690, maxGen 125,
built 567.
After (16k-tick validation): population 250, fitness 5097, maxGen 26 (fresh
window), built 405. Guardrails: pass (no population crash, no fitness drop,
self-test green).
