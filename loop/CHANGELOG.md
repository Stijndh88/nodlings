# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 24 (A/B) — day 326.1 + 8k ticks — `kept` (STRUCTURAL: kiln-seeded sparks)

**Hypothesis** (priority #1; brickCells stuck at 65): dry sparks try 8 random cells and strike one beside clay (`world.js`), so fires land where they can fire bricks. Baseline batch to day 326.1 passed (gap 2292).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 65 |
| benchmark gap | 2292 | 2242 |
| medianFitness | 1293 | 1229 |

Guardrails passed; target unchanged, so a null result within noise. Kept per rule (equal), but brickCells has now not moved across four brick-related cycles: the next cycle should inspect why (ignition needs a flammable top, and clay tiles may rarely sit beside one).

## Cycle 23 (A/B) — day 310.4 + 8k ticks — `reverted` (STRUCTURAL: sun-baked brick)

**Hypothesis** (priority #1; brickCells stuck at 65): clay left on top of a stack dries into brick at 0.01 x warmth per sampled visit (`world.js`), so bricks no longer need a rare fire beside clay. Baseline batch to day 310.4 passed (gap 2292).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 65 |
| builtCells | 503 | 561 |
| benchmark gap | 2292 | 2044 |
| medianFitness | 1244 | 995 |

Guardrails passed, but no gain on target and gap/median fell (-11%/-20%): reverted. brickCells identical at 65 in both runs suggests new bricks are not accumulating (clay may be consumed/moved before drying, or the metric counts only a fixed set); worth inspecting the metric before another brick hypothesis.

## Cycle 22 (A/B) — day 294.8 + 8k ticks — `kept` (STRUCTURAL: more lightning ignitions)

**Hypothesis** (priority #1; brickCells stuck at 65): doubling the dry-spark ignition rate (0.002 -> 0.004 x warmth in `world.js`) gives more fires near clay, so more bricks. Baseline batch to day 294.8 passed (gap 2269).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 5 |
| brickCells | 65 | 65 |
| builtCells | 612 | 667 |
| benchmark gap | 2269 | 2223 |
| medianFitness | 1018 | 1032 |

Guardrails passed; cluster +1 but bricks unchanged: within noise. Kept per rule.

## Cycle 21 (A/B) — day 279.2 + 16k ticks — `kept` (STRUCTURAL: weathering mutual support)

**Hypothesis** (priority #1, plateau.js demanded structural): stacks orthogonally adjacent to a durable stack (>=2 high) skip weathering, so clusters persist. Baseline batch (40k ticks; 80k timed out) passed, gap 2246.

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 65 |
| builtCells | 821 | 733 |
| benchmark gap | 2246 | 2269 |
| medianFitness | 815 | 827 |

Guardrails passed; target unchanged (within noise). Kept per rule, no evidence of effect.

## Cycle 20 (A/B) — day 254.2 + 8k ticks — `reverted` (comm: LISTEN_BONUS 0.15 -> 0.3)

**Hypothesis** (priority #2): doubling the reward for hearing a call near a predator strengthens alarm-call learning. Baseline batch to day 254.2 passed (gap 2123); plateau.js: tuning still productive.

| | control | treatment |
|---|---|---|
| commSeparation | 0.0448 | 0.0124 |
| benchmark gap | 2123 | 2015 |
| largestCluster | 6 | 3 |
| medianFitness | 881 | 957 |

Guardrails passed but target metric worse: reverted.

## Cycle 19 (A/B) — day 238.6 + 8k ticks — `reverted` (STRUCTURAL: night shelter bonus)

**Hypothesis** (priority #1, plateau.js demanded structural; gap, largestCluster, brickCells flat): +0.05 per-tick reward for standing in a cell >=5° warmer than ambient at night (`SHELTER_BONUS`), so building shelter pays off directly. Baseline batch to day 238.6 passed (gap 1711). Run by a thread session after the 12:23 routine run was blocked.

| | control | treatment |
|---|---|---|
| medianFitness | 1504 | 903 (-40%, guardrail tripped) |
| largestCluster | 2 | 2 |
| builtCells | 390 | 321 |
| benchmark gap | 2123 | 2200 |

Guardrail failed on median fitness and the target metric did not move: reverted.

## Cycle 18 (A/B) — day 227.9 + 8k ticks — `kept` (STRUCTURAL: kiln clay bonus)

**Hypothesis** (priority #1, plateau.js demanded structural; gap, largestCluster, brickCells flat): reward dropping clay next to an active fire (`KILN_BONUS = 0.5`) so the clay->fire->brick chain is learnable. Baseline batch to day 222.9 passed (gap 1711).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 65 |
| builtCells | 768 | 768 |
| benchmark gap | 1711 | 1711 |
| commSeparation | 0.0286 | 0.0286 |

Metrics are bit-identical: the bonus never triggered in 8k ticks (nobody drops clay beside fire). Guardrails passed; kept per rule (not worse) but no effect. Next: make clay/fire co-occurrence discoverable (e.g. fire-near sense, or seed clay near fire) rather than reward the rare act.

## Cycle 17 (A/B) — day 207.3 + 8k ticks — `kept` (STRUCTURAL: food cache bonus)

**Hypothesis** (priority #1, plateau.js demanded structural): reward eating food from a cell with >=2 durable neighbours (`CACHE_BONUS = 0.5`), giving enclosed cells a payoff without reducing stacking (cycle 14's lesson).

| | control | treatment |
|---|---|---|
| largestCluster | 2 | 2 |
| builtCells | 371 | 399 |
| brickCells | 65 | 65 |
| benchmark gap | 2010 | 1882 |
| commSeparation | 0.0323 | 0.0068 |
| medianFitness | 1322 | 1331 |
| population | 400 | 402 |

Guardrails passed (gap -6%). Target (largestCluster) unchanged; differences are within noise. Kept per rule (not worse), but no evidence of effect: revert if clusters stay <=3 after 2 batches. commSeparation is noisy (0.004-0.06 across cycles).

## Cycle 16 (A/B) — day 191.7 + 8k ticks — `kept` (comm: alarm-call bonus 0.5)

**Hypothesis** (priority #2): cycle 15's LISTEN_BONUS gain did not persist (commSeparation 0.0041 at the baseline). Make calling made with a predator near worth 0.5 (was 0.25, same as a food call) so alarm calls are distinguishable from food calls.

| | control | treatment |
|---|---|---|
| commSeparation | 0.0054 | 0.0158 |
| benchmark gap | 2032 | 1807 |
| largestCluster | 4 | 4 |
| builtCells | 705 | 699 |
| medianFitness | 1106 | 1026 |
| population | 399 | 400 |

Guardrails passed (gap -11%). Target up ~3x but absolute values are tiny and this is one 8k sample, within noise. Gap has now dropped in two comm cycles in a row: revert if it stays below ~1900 after the next batches.

## Cycle 15 (A/B) — day 176.1 + 8k ticks — `kept` (comm: LISTEN_BONUS 0.15)

**Hypothesis** (priority #2, communication): plateau.js said tuning is still productive, so a non-structural change. Reward hearing a call while a predator is near (`LISTEN_BONUS = 0.15` in `nodling.js`), so listening to sound becomes learnable without hardcoding a flee direction.

| | control | treatment |
|---|---|---|
| commSeparation | 0.0264 | 0.0589 |
| benchmark gap | 2129 | 1828 |
| largestCluster | 3 | 3 |
| builtCells | 352 | 465 |
| medianFitness | 1229 | 1133 |
| population | 402 | 400 |

Guardrails passed (gap -14%, limit 25%). Target moved the right way, but this is one 8k-tick sample and within noise; the benchmark gap drop is a watch item. Revert if commSeparation is not above ~0.03 or the gap keeps falling after the next 2 batches.

## Cycle 14 (A/B) — day 160.4 + 8k ticks — `reverted` (STRUCTURAL: enclosure insulation)

**Hypothesis** (priority #1, plateau.js demanded a structural change): give a thermal payoff to clustering, x1.5 insulation in `cellTemp` when >=3 neighbouring cells hold durable material, so walls near each other are selected for.

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| builtCells | 814 | 435 |
| brickCells | 65 | 64 |
| benchmark gap | 2129 | 1889 |
| medianFitness | 933 | 933 |
| population | 399 | 401 |

Guardrails passed, but the target did not move and builtCells and benchmark gap fell (single sample, partly noise). Reverted. Next: a payoff that does not reduce stacking, e.g. a food or water cache bonus inside clusters.

## Cycle 13 (A/B) — day 144.8 + 8k ticks — `reverted` (BUILD_ADJACENT_BONUS 0.3 -> 0.9)

**Hypothesis** (priority #1): largestCluster fell to 2 at the baseline, so triple the adjacency bonus to push extension of structures.

| | control | treatment |
|---|---|---|
| largestCluster | 3 | 3 |
| builtCells | 535 | 414 |
| brickCells | 65 | 65 |
| benchmark gap | 2129 | 1949 |
| medianFitness | 906 | 1085 |
| population | 400 | 399 |

Guardrails passed, but the target did not move and builtCells and benchmark gap fell (single sample, partly noise). Reverted. Next: a structural idea, since a stronger bonus alone does not make clusters.

## INCIDENT: day 129.2 — baseline batch tripped a guardrail

Baseline batch (25k ticks) from day 113.6: median fitness dropped 35.7% (692 vs 1077, max 25%). Other metrics fine: population 251, benchmark gap 1929 (was 1916), maxGen 53, largestCluster 3, brickCells 66. Likely turnover from many new generations (living-median is noisy), but not auto-diagnosed. No code change this cycle; human review needed.

## Cycle 12 (A/B) — population cap — `kept` (POP_CAP 250 -> 400)

**Question** (from Stijn): is the 250 cap limiting progress, or does food already limit the population?

Paired A/B from the same snapshot (day ~140), 10k ticks, only `POP_CAP` changed. New metrics `meanEnergy`, `floraCount`, `deaths` (by cause) were added to read the ecosystem; they don't affect the simulation.

| cap | population | flora cells | mean energy | starved deaths | median fit | cluster | bench gap | runtime/10k ticks |
|---|---|---|---|---|---|---|---|---|
| 250 | 249 | 7862 | 173 | 1237 | 1262 | 2 | 2038 | 59 s |
| 400 | 403 | 6145 | 173 | 2090 | 1256 | 3 | 2129 | ~100 s |
| 600 | 599 | 6074 | 163 | 3477 | 986 | 3 | 1984 | n/a |
| 1200 | 1200 | 2229 | 137 | 7938 | 748 | 4 | n/a | 388 s |

**Finding:** the population always fills the cap, so the cap, not food, is what limits it at 250 (flora 7862 cells, energy 173/240). Food becomes limiting somewhere around 800 to 1200 (flora drops to 2229, energy 137, starvation 6x). Beyond ~600 median fitness falls from crowding and runtime explodes (6.6x for 4.8x the population), which would break the 10-minute cycle budget.

**Change:** 400 is the sweet spot: same energy and median fitness as 250, larger clusters and benchmark gap, ~1.7x runtime. `POP_CAP` is now a tunable in [250, 800]; raise it again only if batch time stays under ~6 min.

## Cycle 11 (A/B) — day 129.2 + 8k ticks — `STRUCTURAL: kept`

**Hypothesis** (priority #1, construction): the nest bonus counts scattered stacks, and largest built cluster is only 3-4 cells, so building is scatter, not villages. Reward placing durable material next to an existing durable structure (`BUILD_ADJACENT_BONUS = 0.3` in `nodling.js`), so extending a structure is reinforced by the Hebbian rule.

Paired A/B from the same day-129.2 snapshot, 8k ticks:

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 5 |
| builtCells | 690 | 539 |
| benchmark gap | 1929 | 2038 |
| medianFitness | 1067 | 1006 |
| population | 251 | 248 |

Guardrails passed. Cluster and benchmark gap moved the right way, but builtCells (690 -> 539) and median fitness fell; one 8k-tick sample is within noise; the next batches (25k ticks) are the real test. Revert if `largestCluster` is still <= 5 after 3 batches.

## Guardrail fix — day 129.2

The INCIDENT above was a false positive: living-population median fitness is age-driven and dropped as new generations replaced old survivors, while benchmark gap (1916 -> 1929) and every other metric were healthy. Median fitness is now a guardrail only in paired `--dry` A/B runs. Treat the day 129.2 batch as a good baseline; no code change needed.

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
