# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — day 51 → day 61

**Hypothesis (priority signal 2, communication):** the sound channel is sensed
(heard freq/dir, senses 22-24) but only the caller gets rewarded for
meaningful calls (bonus near food/predator). Listeners have no reward tied to
hearing, so the sound→meaning correlation has nothing pulling it toward being
learnable. Added a symmetric listener bonus in `nodling.js` `tick()`: hearing
a sound while food or a predator is actually near *this* Nodling now earns
`bonus += 0.15`, reinforcing the co-occurrence of heard-sound senses with
real local salience.

Before (baseline, day 51.7): fitness 4304, population 247, maxGen 83, built 647.
After (validation, day 61.7): fitness 4811, population 250, maxGen 30, built 289.

Fitness rose, population held at cap, no guardrail violations — kept. (maxGen
and built dropped because the validation window is much shorter than the
batch it's compared against, not a regression — both are cumulative/frontier
stats that reset expectations over a short 16k-tick slice.)
