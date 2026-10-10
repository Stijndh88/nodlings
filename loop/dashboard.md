# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the **benchmark gap**: how much better the evolved Nodlings do than random ones (higher is better). The glossary at the bottom explains every number.

Updated 2026-10-10T20:39Z. Now: day 419.81, benchmark gap **2318** (evolved gene pool minus random genomes), largest built cluster 11, 845 brick cells, max generation 518.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 32 | 419.81 | 2318 | 1084 | 11 | 845 | 518 | 0.048 |
| 31 | 412 | 2318 | 1068 | 15 | 797 | 505 | 0.0094 |
| 30 | 404.19 | 2110 | 1229 | 8 | 735 | 489 | 0.0145 |
| 29 | 396.38 | 2256 | 1376 | 8 | 633 | 479 | 0.0055 |
| 28 | 380.75 | 2120 | 1135 | 7 | 456 | 454 | 0.0007 |
| 27 | 365.13 | 2120 | 1035 | 4 | 191 | 428 | 0.011 |
| 26 | 357.31 | 2313 | 1018 | 4 | 90 | 414 | 0.0661 |
| 25 | 349.5 | 2230 | 868 | 4 | 65 | 403 | 0.0317 |
| 24 | 341.69 | 2230 | 1435 | 4 | 65 | 394 | 0.0215 |
| 23 | 326.06 | 2292 | 1270 | 4 | 65 | 382 | 0.0196 |
| 22 | 310.44 | 2292 | 1275 | 4 | 65 | 356 | 0.016 |
| 21 | 294.81 | 2269 | 1133 | 4 | 65 | 331 | 0.0217 |
| 20 | 279.19 | 2246 | 1141 | 3 | 65 | 314 | 0.0062 |
| 19 | 254.19 | 2123 | 727 | 4 | 65 | 279 | 0.0033 |
| 18 | 238.56 | 1711 | 1147 | 3 | 65 | 254 | 0.0017 |

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
- **reverted**: world.js: clay on top of a stack dries to brick at 0.01 x warmth per sampled visit (cluster 4->4, brickCells 65->65, bench gap 2292->2044, medianFitness 1244->995; no gain on target, others worse)
- **kept**: world.js: lightning spark prefers (8 tries) a cell adjacent to clay (cluster 4->4, brickCells 65->65, builtCells ?->536, gap 2292->2242, medianFitness 1293->1229; null result, within noise)
- **kept**: world.js: ignite(idx, kiln) lets a kiln-seeded spark light bare ground beside clay (all metrics identical to control (cluster 4, bricks 65, gap 2230); never fired in 8k ticks, null result)
- **kept**: world.js: shoreline sand re-deposits clay (4 tries/tick x 0.05) (brickCells 65->82, cluster 4->4, gap 2230->2313, medianFitness 963->878; single 8k sample)
- **kept**: world.js tidal clay deposit chance 0.05 -> 0.15 (brickCells 114->157, cluster 4->5, gap 2313->2120, medianFitness 1265->1225; single 8k sample)
- **reverted**: nodling.js: BUILD_ADJACENT_BONUS paid per durable neighbour (up to 4x) instead of once (cluster 6->5, builtCells 634->712, brickCells 305->267, gap 2120->2103; worse on target)
- **kept**: nodling.js alarm call bonus 0.5 -> 0.75 when predator near (commSeparation 0.0194->0.0228, gap 2120->2256, cluster 8->7, bricks 496->488; single 8k sample, within noise)
- **kept**: nodling.js alarm call bonus 0.75 -> 1.0 when predator near (commSeparation 0.0153->0.0158, gap 2256->2110, cluster 8->8, bricks 685->673; within noise)
- **kept**: brain.js LEARN_RATE 0.02 -> 0.03 (gap 2110->2318, cluster 9->14, bricks 779->790, medianFitness 1084->1332, comm 0.0098->0.0165; single 8k sample, partly noise)
- **reverted**: brain.js LEARN_RATE 0.03 -> 0.04 (gap 2318->2273, cluster 13->10, comm 0.0411->0.0071, median 1047->1175; no gain on target, others worse)

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
