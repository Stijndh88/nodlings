# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day ~51.7→61.7 — kept

Priority signal #1 (villages) is already far past target this run: `built`=561
at day 51.7 vs the `built >= 25` milestone, sustained since day 1.3 — no
change needed there. Moved to priority signal #2 (communication): the sound
channel's "informative call" bonus (calling while food is underfoot or a
predator is nearby, in `nodling.js` `tick()`) only added `+0.25` to the
learning-reward bonus, a small fraction of the reward's `[-1,1]` clamp range.
Raised it to `+0.45` to strengthen the selection pressure for calling in
contextually meaningful situations, making the emission/behavior correlation
easier for evolution to pick up on.

Note: each `run-headless.js` invocation reseeds a fresh 70-Nodling population
from the hall of fame (only hall-of-fame genomes + tick counter persist —
matches `main.js`'s own startup, not a bug), so `maxGen` resets near 0 and
climbs back up every run; this is expected, not a population crash.

- before (batch, day 51.7): population 250, fitness 5070, maxGen 135, avgBrain 86.3, built 561
- after (validation, day 61.7, fresh reseed): population 250, fitness 5070, maxGen 26, avgBrain 90.4, built 441
- guardrails: pass (0% fitness drop, 0% population drop)
