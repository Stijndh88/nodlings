# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 (day ~51.7 → 61.7)
**Hypothesis (signal #2, communication):** the sound channel already carries an
emitter-side bonus for informative calling (near food/predator) and listeners
already get heard-freq/direction as sensory input, but any sound→behavior
correlation has to be learned within a lifetime via the plastic brain's
Hebbian-style updates. Raising `LEARN_RATE` should make that in-lifetime
learning (and other multi-step correlations, helping signal #3's plateau)
faster/stronger.

**Change:** `brain.js` `LEARN_RATE` 0.02 → 0.035 (within declared range
[0.005, 0.05]).

**Before (baseline, day 51.7):** population 250, fitness 4453, maxGen 137, built 749.
**After (day 61.7, 16k ticks):** population 250, fitness 5190 (+16.5%), maxGen 24 (new post-baseline lineage depth), built 357.

**Verdict:** `kept` — no guardrail tripped, fitness improved.
