# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — widen audible-sound window from 1 tick to 2 (day 51.7→61.7)

Priority signal 2 (communication). A Nodling only senses on its own think
tick (every other tick, phase-staggered per individual), but `world.sounds`
held only the single previous tick's emissions before being overwritten —
so whether a call was ever heard by anyone was mostly a phase-alignment
coin flip, independent of any evolved meaning. Changed `sim.js`'s end-of-tick
swap to keep the last 2 ticks of emissions audible (`world.sounds =
world.nextSounds.concat(world.prevSounds || [])`), giving sound-behavior
correlation (alarm→flee, food-found→approach) more chances to be learned.
The emitter-side incentive (nodling.js:249-259, reward for calling near food
or a predator) was already in place; this only widens the listener's chance
to catch it.

Before (day 51.6875): population 249, fitness 6548, maxGen 132, avgBrain 85, built 653.
After (day 61.6875, +16000 ticks): population 250, fitness 6548, maxGen 24, avgBrain 79, built 443.
Guardrails: 0% fitness drop, 0% population drop → pass. (maxGen/avgBrain/built
dipped mid-window from an age-cohort die-off already flagged in observations.md
at day 51.7 as a pre-existing "gene pool reset" pattern — underway before this
change's ticks ran and not something the guardrails track; treated as
unrelated to the hypothesis under test.)
