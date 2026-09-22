# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → validated to day 61.7 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel exists
(caller emits a frequency, listeners sense heard-freq/dir) but a call was only
audible for the single tick right after it was emitted. Since each Nodling
only thinks on every other tick (2-phase stagger), roughly half the nearby
population could never land a think-step during that 1-tick window — capping
how often a caller/listener pair could ever correlate a call with an outcome,
independent of whether meaning had evolved. Widened the audible window from 1
tick to 2 (`world.soundHistory` rolling buffer in `world.js`, swap logic moved
into `sim.js`) so a call is reachable on either think-phase, without touching
frequency semantics, EARSHOT, or reward magnitudes.

- Before (batch, day 51.7): population 249, fitness 4911, maxGen 131, built 615
- After (validation, day 61.7): population 250, fitness 5646, maxGen 27, built 412
- Guardrails: pass (no population crash, no NaN, selfTest ok, fitness up not
  down, population up not down)

Kept. Whether this alone is enough to make caller/listener correlation show
up in the observation log is for a future cycle to check (no existing
instrumentation surfaces sound-behavior correlation yet — a good STRUCTURAL
candidate for a later cycle).
