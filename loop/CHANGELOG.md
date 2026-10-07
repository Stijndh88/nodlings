# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Harness overhaul — day ~98 — `STRUCTURAL:`

Not a sim-behavior change; fixes the instrument (see the audit doc). Findings:
peak fitness (6163) could never fall, each process regenerated a new random map
(`built` 177/131/76 on identical code), `gen` wasn't saved (`maxGen` reset to 0),
validation was one noisy run, and there was no CI.

- Continuous world: `loop/world.json.gz` snapshot resumed every batch; fixed `world_seed`; `gen` saved; novelty archive uses the seeded RNG. Runs are deterministic.
- New metrics (`metrics.js`): living median/mean fitness, largest built cluster, brick cells, comm separation, and a benchmark (evolved vs random genomes on fixed seeds). `history.jsonl` + `progress.svg` track every cycle.
- Guardrails now compare against a paired control from the same snapshot (see RULES.md).
- `loop/hypotheses.json` ledger; CI workflow (`.github/workflows/ci.yml`).
- Cycles 1 and 2 above were validated under the old harness: their effect sizes are unverified. Cycle numbers in `state.json` (9) include sessions whose PRs were closed unmerged.

## Cycle 2 — day 92.9→97.9 — `kept`

**Hypothesis** (priority #1, brick/kiln chains): bricks rose 1→44 after the
last bump to FIRE_SPREAD_RATE; raise 0.06 → 0.09 (within [0.01, 0.2]) for more
clay-adjacent flame and more kiln-style firing.

- Before: population 249, fitness 6163, built 185, day 92.9
- After (8k-tick validation): population 248, fitness 6163, built 141 (metric snapshot, not clearly comparable), day 97.9 — guardrails passed.

## Cycle 1 — day 51.7→61.7 — `kept`

**Hypothesis** (priority #1, brick/kiln chains): only 1 brick had ever been
fired by day 51.7 despite 8312 durable structures, because the clay→brick
conversion only happens on tiles adjacent to an *active* fire, and fire
spread was hardcoded to a flat 0.04 per-neighbour chance per tick (not yet
wired up as the `FIRE_SPREAD_RATE` tunable RULES.md already declares).
Extracted that magic number into a named `FIRE_SPREAD_RATE` constant in
`world.js` and raised it from 0.04 → 0.06 (within the declared [0.01, 0.2]
range) so fires burn wider/longer, giving clay tiles more chances to sit
next to flame and get fired into brick — a precondition for kiln chains.

- Before: population 247, fitness 4904, built 739 (cumulative), day 51.7
- After (16k-tick validation): population 251, fitness 5203, day 61.7 — guardrails passed, no population/fitness drop.
