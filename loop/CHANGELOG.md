# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — `kept`

**Signal:** #2 communication — sound channel carries no evolved meaning yet.
Caller side already rewards calling near food/danger; nothing rewarded the
listener for reacting to what it hears.

**Hypothesis:** add a receiver-side bootstrap bonus (`nodling.js`, `tick()`):
when a Nodling hears a directional sound while a predator is close to *it*
(sense `s[40] > 0.3`), reward moving away from the sound source. This biases
the alarm→flee correlation to be learnable without hardcoding sound meaning.

**Before → after (16k-tick validation):**
- population: 245 → 249
- fitness: 4852 → 5247
- built: 841 → 463 (not guardrailed; watch next cycle)
- maxGen: 134 → 29 (not guardrailed; short validation window, not a generation reset)

Guardrails passed (no fitness/population drop). Kept.
