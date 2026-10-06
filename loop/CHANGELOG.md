# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle @ day 51.7 — STRUCTURAL: kept

**Priority signal:** #1 multi-step construction / villages. `built` (durable
structure cells) was only rewarded indirectly, via the nest bonus a newborn
gets when bred inside a cluster — the act of stacking itself gave no signal,
so there was little pressure to learn "carry durable material to an existing
pile" specifically.

**Change:** in `nodling.js`'s drop handling, stacking a durable material
(wood/plank/stone/brick — same set `observer.js` counts as `built`) onto a
cell that already has something in it now gives a small reward bonus (+0.2,
same scale as the existing food/predator call-signal bonus). First-block
drops (empty cell) are unaffected, so this specifically rewards *extending*
a structure, not just hoarding anywhere.

**Validation (16000 ticks, day 51.7→61.7):**
- fitness: 5667 → 5667 (hall-of-fame best, unaffected — no drop)
- population: 250 → 250 (at cap — no drop)
- built: 789 (after the 80k-tick baseline batch) → 464 (after only 16k ticks
  from a fresh reseed in this process — not a controlled comparison, since
  each `run-headless.js` invocation reseeds the live population from the
  hall of fame; `built` growth needs to be judged over the next few cycles'
  trend, not this one validation window)
- maxGen: 139 → 22 — expected, not a regression: `maxGen` is the deepest
  lineage in the *current* population, which resets low on every fresh
  reseed and grows with ticks elapsed (16k ticks this run vs. 80k for the
  baseline). Not a guardrail metric.

Guardrails passed (no fitness/population drop, no NaN, self-test OK). Kept;
watch `built` trend over upcoming cycles to judge the actual effect.
