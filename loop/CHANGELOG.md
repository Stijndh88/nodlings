# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## [day 61.7] LEARN_RATE 0.02 → 0.03 — `kept`

Hypothesis: signal 3 (sustained growth) — observations log shows repeated
fitness/generation plateaus once the population stabilizes; faster
within-lifetime plasticity might help individuals (and thus selection)
keep exploring instead of settling. Bumped `brain.js`'s `LEARN_RATE` from
0.02 to 0.03 (within the declared [0.005, 0.05] range).

Before (day 51.7, baseline batch): population 250, fitness 5543, maxGen 137,
avgBrain 86.2, built 644.
After (day 61.7, validation +16000 ticks): population 251, fitness 5543,
maxGen 30, avgBrain 84.3, built 360.

No guardrail violations (fitness held, population stable, no NaN, selfTest
passed). maxGen dropped sharply (137→30), i.e. the deepest-lineage
individuals didn't persist across this window — normal generational
turnover, not a guardrail signal, but worth watching next cycle to see if
higher plasticity is making lineages more volatile.
