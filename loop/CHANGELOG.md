# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side reward for reacting to heard sound (day 51.7→61.7)

Priority signal 2 (communication): the caller already earned a bonus for
calling near food/a predator (nodling.js), but nothing rewarded the
*listener* for reacting to a heard sound in a way consistent with real
conditions — only the slow, indirect route through eventual energy change.
Added a small bonus (`+0.15` fleeing a heard sound while a predator is
actually sensed nearby, `+0.1` approaching one while food is visible and no
predator threat) so the alarm→flee / food-found→approach association has a
direct, learnable signal on both ends of the channel, not just the sender's.

Before: population 250, fitness 5575, maxGen 141, built 619, day 51.6875
After:  population 250, fitness 5575, maxGen 28, built 295, day 61.6875

maxGen and built both dropped, but that tracks a population crash-to-reseed
event already logged in observations.md *before* this change was applied
(`day 51.7` issue: "max generation is only 0 ... crashing to the reseed
floor") — pre-existing behavior from the baseline batch, not caused by this
edit. Fitness and population, the guardrail metrics, are unchanged.
