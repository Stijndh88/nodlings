# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**STRUCTURAL: kept** — Signal 2 (communication). The sound channel only
rewarded the *speaker* for calling near food/predators (`nodling.js` existing
`bonus += 0.25`); nothing rewarded a *listener* for reacting to a heard sound,
so there was no selection pressure to actually use the channel. Added the
listener half: a hungry Nodling (`energy < MAX_ENERGY*0.4`) that moves toward
the nearest heard sound's source gets `bonus += 0.05`. Stores the heard
sound's offset (`this.heardSound`) in `sense()` so it survives to the
movement step. This closes the loop — callers and listeners can now
co-evolve a shared meaning for a frequency, instead of calling being a
one-sided, unreinforced cost.

Before → after (16k validation ticks, day 51.7 → 61.7):
- population: 251 → 251
- fitness: 4653 → 5016
- maxGen: 147 → 31 (population went through a hall-of-fame reseed mid-run,
  per observations.md; guardrails don't gate on maxGen and population/fitness
  held, so not treated as a regression)
- built: 731 → 473
- avgBrain: 90.4 → 81.1

Guardrail check: pass (no fitness/population drop beyond thresholds, no
NaNs, selfTest passed).
