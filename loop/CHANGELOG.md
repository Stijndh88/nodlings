# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — `kept`

**Hypothesis (signal 1, construction/villages):** `FIRE_SPREAD_RATE` (fire's
chance to ignite a flammable neighbour) was a hardcoded `0.04` inside
`stepFire()` in world.js, not yet a named tunable despite being declared in
RULES.md. Extracted it to a named const and raised it to `0.06` (within the
declared `[0.01, 0.2]` range), on the theory that more fire reaching clay
piles fires more brick (kiln chains → priority signal 1).

**Before → after (16k-tick validation window):**
- population 248 → 251
- fitness 5122 → 5825
- built (durable-structure snapshot) 778 → 357 — dropped notably; higher
  spread also burns down existing wood/plank stacks faster than before,
  likely offsetting the extra brick production.

**Guardrail result:** `pass: true` (population/fitness/selfTest all clear
the RULES.md guardrails — "built" isn't a guardrailed metric). Kept per
policy, but flagging the built-count drop for a future cycle: if it
persists across the next couple of cycles, consider reverting or pairing
this with a structural change that protects standing structures from
fire (e.g. exempt already-built stacks, or make brick fireproof sooner).
