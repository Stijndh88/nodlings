# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: cycle 4 (day 51.7 → 61.7) — weight alarm calls higher than food calls

**Hypothesis (priority signal 2, communication):** the sound-emission bonus in
`nodling.js` gave the same flat +0.25 reward for calling near food *or* near a
predator. Food is abundant (8553 flora vs 251 pop at day 51.7) so a food-call
is nearly free to trigger and carries little information, while predator
encounters are rare (6 predators) — a flat shared reward gives the population
little pressure to evolve a signal that actually distinguishes the two cases.
Split the bonus: predator-alarm calls now earn +0.4, food calls +0.15, so
alarm signalling is worth more to get right and has more reason to diverge
from food signalling.

Before (day 51.7, baseline): population 250, fitness 4870, maxGen 143, built 653.
After (day 61.7, validation, 16k ticks): population 250, fitness 5178, maxGen 27, built 379.

Guardrails passed (no fitness/population drop vs baseline; self-test ok).
`maxGen` and `built` are point-in-time snapshots of the *current* population/
map (max gen among nodlings alive right now; structures standing right now),
not cumulative counters, so they can legitimately fall between snapshots —
here, most likely the deepest lineage present at day 51.7 died out (predators
had 16 kills and a fit lineage of their own) while shallower lineages carried
on, and some structures decayed/were consumed. Not something this cycle's
guardrails gate on (only fitness/population drop, NaN, self-test). Marked
`kept`.
