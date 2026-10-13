# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the **benchmark gap**: how much better the evolved Nodlings do than random ones (higher is better). The glossary at the bottom explains every number.

Updated 2026-10-13T20:29Z. Now: day 567.94, benchmark gap **2237** (evolved gene pool minus random genomes), largest built cluster 66, 2188 brick cells, max generation 809.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 50 | 567.94 | 2237 | 1156 | 66 | 2188 | 809 | 0.0422 |
| 49 | 564.03 | 2237 | 965 | 47 | 2189 | 801 | 0.0117 |
| 48 | 560.13 | 2237 | 1047 | 34 | 2149 | 792 | 0.0481 |
| 47 | 556.22 | 2237 | 1268 | 34 | 2120 | 786 | 0.0454 |
| 46 | 552.31 | 2237 | 1146 | 42 | 2064 | 774 | 0.0068 |
| 45 | 548.41 | 2237 | 1002 | 37 | 2054 | 767 | 0.0516 |
| 44 | 544.5 | 2274 | 908 | 34 | 1997 | 758 | 0.0306 |
| 43 | 528.88 | 2260 | 794 | 52 | 1931 | 723 | 0.0043 |
| 42 | 513.25 | 2260 | 924 | 34 | 1763 | 695 | 0.0506 |
| 41 | 505.44 | 2239 | 1336 | 32 | 1747 | 682 | 0.0687 |
| 40 | 497.63 | 2264 | 1233 | 26 | 1642 | 667 | 0.0428 |
| 39 | 489.81 | 2275 | 1066 | 17 | 1537 | 651 | 0.0344 |
| 38 | 474.19 | 2324 | 927 | 14 | 1400 | 620 | 0.0198 |
| 37 | 458.56 | 2324 | 1358 | 16 | 1205 | 592 | 0.0783 |
| 36 | 450.75 | 2332 | 1050 | 12 | 1101 | 576 | 0.0166 |

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
- **kept**: BUILD_ADJACENT_BONUS 0.3 -> 0.5 (cluster 8->9, bricks 897->903, gap 2318->2257, medianFitness 1297->1157, comm 0.045->0.033; single 8k sample, within noise)
- **kept**: BUILD_ADJACENT_BONUS 0.5 -> 0.7 (cluster 8->11, bricks 962->980, gap 2257->2341, median 1177->1192, comm 0.0081->0.0383; single 8k sample, within noise)
- **kept**: BUILD_ADJACENT_BONUS 0.7 -> 0.85 (cluster 12->14, bricks 1042->1058, builtCells 1489->1455, gap 2341->2332, median 1038->1028, comm 0.056->0.096; single 8k sample, within noise)
- **reverted**: BUILD_ADJACENT_BONUS 0.85 -> 1.0 (cluster 12->11, bricks 1097->1079, gap 2332->2283, median 1221->1140; no gain on target, others worse)
- **kept**: world.js tidal clay deposit chance 0.15 -> 0.3 (cluster 10->14, bricks 1147->1167, builtCells 1696->1759, gap 2332->2324, median 1221->1113, comm 0.0076->0.0815; single 8k sample, within noise)
- **reverted**: world.js tidal clay deposit chance 0.3 -> 0.5 (cluster 17->15, bricks 1288->1316, builtCells 1658->1719, gap 2324->2190, median 1051->1147, comm 0.026->0.100; target cluster worse, gap lower)
- **kept**: predators.js: prey with >=2 durable neighbours cannot be caught (all metrics identical to control (cluster 16, bricks 1413, gap 2275); never fired in 8k ticks, null result)
- **kept**: FIRE_SPREAD_RATE 0.09 -> 0.12 (cluster 16->22, bricks 1591->1612, builtCells 2016->2042, gap 2275->2264, median 1263->1163; single 8k sample, within noise)
- **kept**: FIRE_SPREAD_RATE 0.12 -> 0.15 (cluster 27->36, bricks 1673->1707, builtCells 2100->2099, gap 2264->2239, median 1194->1139, comm 0.0026->0.0202; single 8k sample, within noise)
- **kept**: FIRE_SPREAD_RATE 0.15 -> 0.18 (cluster 33->33, bricks 1760->1774, builtCells 2245->2264, gap 2239->2260, median 823->932, comm 0.1283->0.0582; single 8k sample, within noise)
- **reverted**: FIRE_SPREAD_RATE 0.18 -> 0.2 (range max) (cluster 44->33, brickCells 1876->1905, gap 2260->2255; 0.18 looks like the plateau)
- **kept**: brain.js LEARN_RATE 0.03 -> 0.025 (gap 2260->2274, median 1054->1107, cluster 48->54, bricks 1957->1966; single 8k sample, within noise)
- **kept**: POP_CAP 400 -> 500 (cluster 33->36, bricks 2065->2048, gap 2274->2237, median 911->1150, comm 0.0461->0.0406; single 8k sample, within noise; 8k run took 4m48 so batches need fewer ticks)
- **reverted**: world.js tidal clay deposit chance 0.3 -> 0.4 (cluster 42->32, bricks 2074->2097, gap 2237->2164, median 1195->860 (-28%, guardrail); worse on target)
- **reverted**: LISTEN_BONUS 0.15 -> 0.1 (commSeparation 0.0586->0.0358, cluster 45->45, bricks 2120->2103, gap 2237->2237, median 1057->1205; worse on target)
- **reverted**: LISTEN_BONUS 0.15 -> 0.2 (commSeparation 0.0564->0.0066, cluster 38->40, bricks 2170->2167, gap 2237->2316, median 941->1159; target worse)
- **reverted**: POP_CAP 500 -> 600 (gap 2237->2234, medianFitness 1247->1076, cluster 41->38, bricks 2179->2187; no gain, runtime 6m08 for 5k ticks)
- **reverted**: brain.js LEARN_RATE 0.025 -> 0.022 (gap 2237->2205, medianFitness 1120->776 (-30.7%, guardrail), cluster 68->45, bricks 2178->2198; worse on target)

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
