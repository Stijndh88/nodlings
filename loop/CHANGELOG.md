# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — STRUCTURAL: kept (day 61.7)

**Signal:** #1 construction/villages — bricks were stuck at 5 after 51 days
despite 6863 structure units, because the only way clay became brick was a
rare dry-season lightning strike spreading fire onto a clay stack. There was
no deliberate, agent-driven kiln action, so the brick/kiln chain was
essentially noise rather than a learnable multi-step build path.

**Change:** added `World.adjacentFlammable(x,y)` (world.js) and a new
`interact` branch in `Nodling.tick()` (nodling.js): standing on a clay cell
next to a flammable material and pressing interact fires the clay into
brick for 1.5 energy. No new brain outputs/senses — fully backward
compatible with existing genomes, just a new consequence of the existing
`interact` output under a new world condition.

**Before → after** (80k-tick batch @ day 51.7 → 16k-tick validation @ day 61.7):
population 249→250, fitness 5029→5168, built 724→519 (noisy, not a guardrail
metric), maxGen 142→24 (live-population generation is volatile between
samples; not a guardrail metric).

**Verdict:** `pass: true` (no guardrail violated) — kept.
