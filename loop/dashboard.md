# Nodlings progress

Updated 2026-10-07T16:30Z. Now: day 160.44, benchmark gap **2129** (evolved gene pool minus random genomes), largest built cluster 3, 65 brick cells, max generation 112.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 13 | 160.44 | 2129 | 722 | 3 | 65 | 112 | 0.0226 |
| 12 | 144.81 | 2129 | 697 | 2 | 65 | 89 | 0.0677 |
| 11 | 129.19 | 1929 | 692 | 3 | 66 | 53 | 0.0407 |
| 10 | 113.56 | 1916 | 1077 | 3 | 68 | 29 | 0.0158 |

## Hypotheses

- **kept**: FIRE_SPREAD_RATE 0.04 -> 0.06 (bricks 1 -> 44; old metrics were not paired, effect size unverified)
- **kept**: FIRE_SPREAD_RATE 0.06 -> 0.09 (peak fitness unchanged (6163); effect unverified under the old harness)
- **untested**: reward hearing a sound while something salient is near (PR #4) (closed unmerged; never validated on a continuous world)
- **untested**: reward fleeing a heard sound when a predator is near (PRs #2, #3) (closed unmerged; hardcodes the alarm->flee direction)
- **kept**: reward +0.3 for placing durable material next to an existing structure (nodling.js BUILD_ADJACENT_BONUS) (first paired A/B: cluster 4 -> 5, builtCells 690 -> 539, bench gap 1929 -> 2038; single 8k-tick sample, within noise)
- **kept**: POP_CAP 250 -> 400 (cap was binding while food was abundant; paired A/B at 250/400/600/1200 in CHANGELOG. POP_CAP now a tunable [250, 800]; runtime grows ~linearly)
- **reverted**: BUILD_ADJACENT_BONUS 0.3 -> 0.9 (cluster 3->3, builtCells 535->414, bench gap 2129->1949; no gain on target, others worse)

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.
