# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — 2026-09-26

**STRUCTURAL: kept.** Priority signal 2 (communication): the sound channel had
a reward for the *caller* (bonus for calling near food/a predator) but nothing
rewarded the *listener* for reacting to what it heard, so there was no
selection pressure for meaning to matter on the receiving end. Tagged each
emitted sound with why it was made (`danger`/`food`), stored the nearest heard
sound per Nodling (`heardSound`), and gave a listener a small bonus (+0.15) for
moving away from a `danger`-tagged sound or toward a `food`-tagged one.
Changed `nodling.js` only (sense(), sound-emission block, movement block).

Before (baseline, 80000 ticks, day 51.7): population 250, fitness 5278,
maxGen 140, built 732.
After (validation, +16000 ticks, day 61.7): population 249, fitness 5615
(+6.4%), maxGen 30, built 380.
Guardrails passed (no population/fitness drop beyond threshold, no NaN,
selfTest ok). Fitness improved without a population hit — keeping it.
