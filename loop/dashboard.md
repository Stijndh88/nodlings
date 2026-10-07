# Nodlings progress

Updated 2026-10-07T10:18Z. Now: day 113.56, benchmark gap **1916** (evolved gene pool minus random genomes), largest built cluster 3, 68 brick cells, max generation 29.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 10 | 113.56 | 1916 | 1077 | 3 | 68 | 29 | 0.0158 |

## Hypotheses

- **kept**: FIRE_SPREAD_RATE 0.04 -> 0.06 (bricks 1 -> 44; old metrics were not paired, effect size unverified)
- **kept**: FIRE_SPREAD_RATE 0.06 -> 0.09 (peak fitness unchanged (6163); effect unverified under the old harness)
- **untested**: reward hearing a sound while something salient is near (PR #4) (closed unmerged; never validated on a continuous world)
- **untested**: reward fleeing a heard sound when a predator is near (PRs #2, #3) (closed unmerged; hardcodes the alarm->flee direction)

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.
