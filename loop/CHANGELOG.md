# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 (day 51.7 → 61.7) — STRUCTURAL: kept

**Signal:** #2 communication — the sound channel exists but carries no evolved
meaning; bias sensory wiring so an emit/react correlation is learnable.

**Hypothesis:** a sound was only audible for exactly 1 tick after emission
(`world.sounds = world.nextSounds`), but Nodlings only re-sense every other
tick, staggered by a fixed per-individual `phase` (0 or 1). Tracing the
parity: a call emitted on a caller's think-tick only ever lands in
`world.sounds` on the tick of *opposite* parity to the caller's own phase —
so any listener sharing the caller's phase could never hear it, at any
distance, ever. That's half of all caller/listener pairs structurally deaf
to each other, which would make any emit→react correlation very hard for
evolution to find or exploit. Fix: keep a call audible for 2 ticks (this
tick's + last tick's emissions, via a new `world.prevSounds` buffer) so both
phase groups get a chance to hear every call. `nodling.js`'s sensing/emission
code itself is untouched — this only widens the window during which an
already-emitted sound is perceptible.

**Files:** `world.js` (added `prevSounds` field), `sim.js` (sound rollover
now unions this tick's and last tick's emissions instead of replacing).

**Before → after** (16000-tick validation vs. the day-51.7 baseline):
population 250→251, fitness 5648→5861, built 601→451 (structures fluctuate
normally; not a guardrail metric). No guardrail tripped (no NaN, no
population/fitness crash vs. baseline). A generation-count dip during the
window (122→22, recovering to 22 by day 61.7) matches this sim's
already-documented boom/bust reseed pattern (see RULES.md signal 3) and
isn't attributable to this change — end-state population and fitness both
held or improved.

**Next check:** future cycles should watch for sound-frequency clustering
by context (e.g. distinct frequency bands for "food here" vs. "predator
near") now that the channel is audible to the whole population, as a sign
meaning is actually evolving.
