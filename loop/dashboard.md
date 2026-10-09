# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the **benchmark gap**: how much better the evolved Nodlings do than random ones (higher is better). The glossary at the bottom explains every number.

Updated 2026-10-09T04:33Z. Now: day 310.44, benchmark gap **2292** (evolved gene pool minus random genomes), largest built cluster 4, 65 brick cells, max generation 356.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 22 | 310.44 | 2292 | 1275 | 4 | 65 | 356 | 0.016 |
| 21 | 294.81 | 2269 | 1133 | 4 | 65 | 331 | 0.0217 |
| 20 | 279.19 | 2246 | 1141 | 3 | 65 | 314 | 0.0062 |
| 19 | 254.19 | 2123 | 727 | 4 | 65 | 279 | 0.0033 |
| 18 | 238.56 | 1711 | 1147 | 3 | 65 | 254 | 0.0017 |
| 17 | 222.94 | 1711 | 1153 | 3 | 65 | 222 | 0.0114 |
| 16 | 207.31 | 1947 | 964 | 2 | 65 | 196 | 0.0087 |
| 15 | 191.69 | 2032 | 987 | 3 | 65 | 167 | 0.0041 |
| 14 | 176.06 | 2129 | 961 | 4 | 65 | 137 | 0.0119 |
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
- **reverted**: world.js cellTemp: x1.5 insulation when >=3 neighbouring cells hold durable material (cluster 4->4, builtCells 814->435, bench gap 2129->1889; no gain on target, others worse)
- **kept**: nodling.js LISTEN_BONUS 0.15: reward hearing a call while a predator is near (commSeparation 0.0264 -> 0.0589; bench gap 2129 -> 1828 (-14%, inside guardrail); single 8k sample, within noise)
- **kept**: nodling.js call bonus 0.25 -> 0.5 when predator near (food-call stays 0.25) (commSeparation 0.0054 -> 0.0158; bench gap 2032 -> 1807 (-11%, inside guardrail); single 8k sample, within noise)
- **kept**: nodling.js CACHE_BONUS 0.5: reward eating food from a cell with >=2 durable neighbours (cluster 2->2, builtCells 371->399, bench gap 2010->1882; within noise, no real gain on target)
- **kept**: nodling.js KILN_BONUS 0.5: reward dropping clay next to an active fire (treatment metrics identical to control (bonus never fired in 8k ticks); no evidence of effect)
- **reverted**: nodling.js SHELTER_BONUS 0.05 per tick in a cell >=5° warmer than ambient at night (medianFitness 1504->903 (-40%, guardrail); cluster 2->2, builtCells 390->321; no gain on target)
- **reverted**: LISTEN_BONUS 0.15 -> 0.3 (commSeparation 0.0448->0.0124, bench gap 2123->2015, cluster 6->3; worse on target)
- **kept**: world.js weathering: stacks beside a durable stack (>=2 high) no longer shed blocks (cluster 4->4, brickCells 65->65, builtCells 821->733, gap 2246->2269; no measurable effect on target)
- **kept**: world.js dry-spark ignition 0.002 -> 0.004 per tick x warmth (more fires near clay) (cluster 4->5, builtCells 612->667, brickCells 65->65, gap 2269->2223; within noise)

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.

## What do these numbers mean?

**Nodling.** One of the little creatures in the simulation. Each has a small evolving "brain"; nobody scripts what it does.

**What is the loop?.** An unattended routine that keeps the world running. Each "cycle" it simulates a long stretch of time, measures how the Nodlings are doing, tries one small change to the rules, tests it, and keeps or reverts it.

**Cycle.** One run of that routine. The cycle number counts up over time.

**Day.** In-world days since the world started (one day is 1,600 simulation ticks). It only measures how long the world has been running, not how well it is going.

**Population.** How many Nodlings are alive right now. It is capped (currently 400), so it normally sits near the cap; a sudden drop would mean trouble.

**Benchmark gap (the headline number).** A test of how much evolution has taught the species. We drop 30 Nodlings built from the best evolved brains, and 30 with random brains, into fresh identical worlds for a while, then compare how long they live and how many offspring they have. The gap is evolved minus random. Random brains score about 320, so a gap near 2,000 means evolved Nodlings do roughly 7x better. Higher is better; a falling gap means the species got worse at surviving.

**Median fitness.** The middle score among the Nodlings alive now, where score = age + 250 per offspring. It moves with the age mix of the population (lots of newborns pulls it down), so it is a rough health reading, not a progress score.

**Max generation.** The longest family line alive: how many parents-to-children steps lead to the oldest-lineage Nodling. A bigger number means evolution has had more rounds of selection.

**Largest cluster.** The biggest group of touching built tiles (wood, plank, stone or brick). It stands in for "village size": scattered single blocks count as 1, a real settlement would be much larger. The project hopes to see this grow.

**Brick cells.** Tiles holding fired bricks. Bricks only appear when clay sits next to fire (a kiln), so this shows whether Nodlings and fire are producing the best building material.

**Comm (call separation).** Whether calls carry meaning. It measures how different the average call pitch is when a predator is nearby versus not. Near 0 means calls are random noise; a rising number means Nodlings call differently when in danger, like an alarm.

**Hypotheses: kept / reverted / untested / running.** Each cycle tests one idea. "kept": it passed the checks and stays. "reverted": it did not help or made things worse and was undone. "untested": proposed but never properly evaluated. "running": being tested right now.

**Guardrails.** Safety checks every change must pass: the population must not crash, no numbers may break, and the benchmark gap must not drop by more than a quarter compared with an identical run without the change.

**Paired test (A/B).** To judge a change fairly, the loop runs the world twice from the exact same saved state, once without and once with the change, and compares. Short runs are noisy, so small differences are often "within noise".

**INCIDENT.** A guardrail tripped on a plain run, so the loop stopped changing things and left a note in the changelog for a human to look at.

**STRUCTURAL.** A changelog tag for a change that adds a new rule or reward, as opposed to just nudging an existing number.
