# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — nest bonus requires actual durable materials (day 51.7→61.7)

Signal 1 (villages: "durable-structure clusters, not just scattered
stacking"). The breeding "nest bonus" (+45 energy to a newborn) counted any
cell with `stack.length >= 2`, including food/corpse piles — not what the
priority signal means by a durable-structure cluster. Changed the nest scan
in `nodling.js` to require wood/plank/stone/brick specifically, matching the
"built" definition `observer.js` already uses, so the reward correctly
targets village-building rather than food hoarding.

Before (baseline, day 51.7): population 64, fitness 5134, maxGen 144, built 720.
After (validation, day 61.7): population 250 (pop cap), fitness 5134, maxGen 28, built 525.

Note: reran the *unmodified* baseline over the same 16k-tick window to check
whether the population boom to the 250 cap and the maxGen drop were caused by
this change — they weren't. Unmodified code over the same window also hits
pop cap 250 with maxGen 31 (fitness 5211, built 472). This is natural
boom-bust volatility in the sim at this point in the run, not a side effect
of the change. Guardrails passed (no drop beyond thresholds, selfTest OK).
`kept`.
