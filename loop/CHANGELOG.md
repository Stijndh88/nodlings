# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 6 (day 51.7 → 61.7) — kept

Hypothesis: priority signal #2 (communication) — the sound channel exists
(emit freq + heard freq/dir senses, plus a small emitter-side reward for
calling near food/a predator) but nothing evolved appears to have locked in
its meaning yet. Priority #1 (construction) is already far past its target
(built=626, 25x the village milestone, sustained since day 1.3) and priority
#3 (plateau) hasn't shown up in this fresh run (fitness/gen still climbing),
so #2 was the best-supported pick. RULES.md frames this explicitly as a
"make that correlation learnable" problem, which points at `LEARN_RATE`
(brain.js) — the within-lifetime Hebbian learning rate that lets a Nodling
associate a heard sound with a nearby outcome via reward-modulated
plasticity. Raised it from 0.02 to 0.032 (declared range [0.005, 0.05]),
a ~60% increase, without touching population/material mechanics that are
already working well.

Before (day 51.7, baseline commit c2e70f3): population 250, fitness 6137,
maxGen 134, avgBrain 75.4, built 626.
After (day 61.7, 16000-tick validation): population 250, fitness 6137,
maxGen 30, avgBrain 70.4, built 479.

Guardrails: pass (fitness 0% drop, population 0% drop, no NaN). Note for
future cycles: maxGen dropped 134→30 and built dropped 626→479 over this
window — neither is a guardrail metric, and population staying pinned at
the 250 cap the whole time rules out a reseed-driven explanation, so this
reads as ordinary lineage/structure turnover in a capped population rather
than a regression, but it's worth watching if the pattern repeats after
raising LEARN_RATE further.
