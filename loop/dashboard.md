# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the **benchmark gap**: how much better the evolved Nodlings do than random ones (higher is better). The glossary at the bottom explains every number.

Updated 2026-10-25T16:30Z. Now: day 1094.03, benchmark gap **2248** (evolved gene pool minus random genomes), largest built cluster 392, 3474 brick cells, max generation 2032.

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
| 119 | 1094.03 | 2248 | 1213 | 392 | 3474 | 2032 | 0.0189 |
| 118 | 1086.22 | 2248 | 935 | 292 | 3464 | 2018 | 0.0126 |
| 117 | 1078.41 | 2248 | 1134 | 297 | 3451 | 1996 | 0.0026 |
| 116 | 1070.59 | 2248 | 1184 | 388 | 3449 | 1969 | 0.0051 |
| 115 | 1062.78 | 2248 | 1038 | 267 | 3449 | 1951 | 0.0017 |
| 114 | 1054.97 | 2248 | 1145 | 289 | 3447 | 1931 | 0.0258 |
| 113 | 1047.16 | 2248 | 1264 | 333 | 3445 | 1909 | 0.0105 |
| 112 | 1039.34 | 2248 | 1078 | 396 | 3433 | 1889 | 0.0008 |
| 111 | 1031.53 | 2248 | 987 | 388 | 3424 | 1873 | 0.0527 |
| 110 | 1023.72 | 2240 | 1014 | 337 | 3422 | 1850 | 0.0323 |
| 109 | 1015.91 | 2240 | 1080 | 190 | 3422 | 1834 | 0.0279 |
| 108 | 1008.09 | 2240 | 1015 | 190 | 3419 | 1815 | 0.0061 |
| 107 | 1000.28 | 2240 | 1394 | 275 | 3406 | 1796 | 0.0215 |
| 106 | 992.47 | 2240 | 916 | 239 | 3395 | 1782 | 0.0143 |
| 105 | 984.66 | 2240 | 1131 | 228 | 3395 | 1763 | 0.0173 |

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
- **kept**: nodling.js breeding eligibility energy > 130 -> 115 (gap 2237->2300, medianFitness 1255->1195, cluster 40->42, bricks 2192->2198, comm 0.0292->0.009; single 5k sample, within noise)
- **reverted**: nodling.js FOLLOW_BONUS 0.3: reward eating found food within 60 ticks of hearing a non-alarm call (commSeparation 0.0698->0.0012, gap 2300->2267, cluster 35->39, median 1053->1069; target comm worse (noisy))
- **kept**: nodling.js BRICK_WALL_BONUS 0.5: extra reward for placing brick next to an existing structure (cluster 39->40, bricks 2217->2229, builtCells 3029->2848, gap 2300->2300, median 1148->1207; single 5k sample, within noise)
- **kept**: nodling.js BRIDGE_BONUS 0.4: reward laying a bridge tile next to an existing bridge tile (cluster 40->48, bricks 2239->2241, gap 2300->2296, median 1036->1052, comm 0.1295->0.0004; single 5k sample, within noise)
- **reverted**: world.js seasonal ambient amplitude 10 -> 12 (4..28 deg) (gap 2296->1882 (-18%), median 1158->1019, cluster 42->63, bricks 2296->2319; target (gap) worse)
- **reverted**: nodling.js breeding eligibility energy > 115 -> 100 (gap 2296->2186, medianFitness 940->1026, cluster 60->69, bricks 2355->2351; target (gap) worse; single 5k sample)
- **kept**: brain.js mutateGenome: per-connection weight mutation probability 0.8 -> 0.5 (gap 2296->2308, medianFitness 1173->1106, cluster 76->55, bricks 2395->2396, comm 0.0184->0.0375; single 5k sample, within noise)
- **kept**: brain.js mutateGenome: weight mutation step magnitude 0.4 -> 0.3 (gap 2308->2344, medianFitness 770->1051, cluster 50->57, bricks 2441->2436, comm 0.0086->0.0249; single 5k sample, within noise)
- **kept**: nodling.js SHARED_MEAL_BONUS 0.3: reward eating found food with another Nodling within 3 cells (gap 2344->2357, medianFitness 946->1012, cluster 42->41, bricks 2488->2490, comm 0.0556->0.0046; single 5k sample, within noise)
- **reverted**: brain.js mutateGenome: plasticity-rate mutation probability 0.3 -> 0.15 (gap 2357->2256, medianFitness 1068->1187, cluster 41->82, bricks 2530->2534, comm 0.0296->0.0464; target (gap) worse)
- **reverted**: brain.js mutateGenome: weight mutation step magnitude 0.3 -> 0.2 (gap 2357->2204, medianFitness 1247->955, cluster 49->55, bricks 2562->2556, comm 0.0123->0.0585; target (gap) worse; single 5k sample)
- **reverted**: brain.js mutateGenome: per-connection weight mutation probability 0.5 -> 0.35 (gap 2357->2161, medianFitness 1049->1194, cluster 82->95, bricks 2577->2583, comm 0.0164->0.0106; target (gap) worse; single 5k sample)
- **kept**: nodling.js THIRST_DRINK_BONUS 0.3: reward drinking while hydration < 40 (all metrics identical to control (cluster 76, bricks 2605, gap 2357, median 1133); bonus never changed behaviour in 5k ticks, null result)
- **reverted**: brain.js mutateGenome: add-connection probability 0.28 -> 0.2 (gap 2357->2132, medianFitness 1103->853, cluster 156->62, bricks 2645->2640; target (gap) worse; single 5k sample)
- **kept**: nodling.js ENCLOSE_BONUS 0.4: extra reward for placing durable material with >=2 durable 4-neighbours (fill gaps, dense villages) (cluster 70->80, bricks 2686->2678, builtCells 3041->3102, gap 2357->2343, median 1007->957, comm 0.167->0.047; single 8k sample, within noise)
- **reverted**: brain.js mutateGenome: plasticity-rate mutation probability 0.3 -> 0.45 (gap 2343->2185, medianFitness 1141->1015, cluster 151->72, bricks 2699->2719, comm 0.0667->0.1137; target (gap) worse; single 5k sample)
- **kept**: nodling.js HUNT_BONUS 0.4: reward striking down a critter (gap 2343->2337, medianFitness 1050->989, cluster 76->88, bricks 2722->2714, comm 0.134->0.070; single 5k sample, within noise)
- **reverted**: brain.js mutateGenome: add-connection probability 0.28 -> 0.35 (gap 2337->2185, medianFitness 893->949, cluster 102->109, bricks 2800->2798, comm 0.206->0.217; target (gap) worse; single 5k sample)
- **reverted**: brain.js mutateGenome add-node (split) probability 0.16 -> 0.22 (gap 2337->2195, medianFitness 1015->1135, cluster 78->65, bricks 2822->2821, comm 0.210->0.305; target (gap) worse)
- **reverted**: brain.js mutateGenome: connection enable-toggle probability 0.1 -> 0.06 (gap 2337->2178, cluster 73->87, bricks 2845->2855; target gap fell ~7%)
- **reverted**: brain.js mutateGenome memory-cell mutation probability 0.14 -> 0.20 (gap 2337->2215, medianFitness 1121->1056, cluster 88->78, bricks 2861->2868, comm 0.1036->0.0991; target (gap) worse; single 5k sample)
- **reverted**: brain.js mutateGenome weight perturbation step 0.3 -> 0.4 (gap 2337->2227, medianFitness 1062->1015, cluster 75->88, bricks 2895->2906, comm 0.2832->0.2756; target (gap) worse; single 5k sample)
- **reverted**: nodling.js COMMUNAL_BUILD_BONUS 0.3: extra reward for adding to a structure with another Nodling within 3 cells (cluster 166->141, brickCells 2938->2927, bench gap 2337->2250; target worse)
- **reverted**: nodling.js HUNGER_EAT_BONUS 0.3: reward eating found food while energy < 50 (bench gap 2337->2190, median 1167->1103, cluster 163->167; target fell)
- **kept**: nodling.js NEST_BREED_BONUS 0.5: parent rewarded for breeding inside a cluster of >=4 stacked cells (cluster 170->173, bricks 2952->2952, gap 2337->2365, median 1138->1055, comm 0.229->0.191; single 3k sample, within noise)
- **reverted**: brain.js mutateGenome add-node (split) probability 0.16 -> 0.12 (bench gap 2365->2109, largestCluster 173->171, brickCells 2980->2985, medianFitness 1110->1134; target fell)
- **reverted**: brain.js mutateGenome memory-cell mutation probability 0.14 -> 0.10 (bench gap 2365->2132; cluster 125->199, brickCells 3005->3024, commSep 0.098->0.137, medianFitness 1131->1128; target (gap) fell ~10%)
- **kept**: brain.js MAX_HIDDEN 60 -> 80 (gap 2365 -> 2366, median 1034 -> 1099, cluster 209 -> 203; within noise (cap rarely binds), harmless headroom)
- **reverted**: nodling.js SHELTER_NIGHT_BONUS 0.05: per-tick reward at night when standing with >=2 durable neighbours (cluster 288->277, bench gap 2366->2177; worse on target)
- **reverted**: brain.js mutateGenome: connection enable-toggle probability 0.1 -> 0.14 (gap 2366->2170, medianFitness 1130->967, cluster 296->229, bricks 3057->3068, comm 0.027->0.032; target (gap) worse; single 3k sample)
- **reverted**: nodling.js: hydration drain halved when >=2 stacked 4-neighbours (largestCluster 219->194, bench gap 2366->2318, medianFitness 1020->1082, thirst deaths 810->366; target worse)
- **reverted**: world.js floraCanGrow: bare cell with >=2 durable 4-neighbours can sprout flora (sheltered gardens inside villages) (cluster 207->207, brickCells 3133->3128, bench gap 2366->2075, medianFitness 913->967; no gain on target, gap fell)
- **reverted**: world.js ignite: kiln fire +4 duration when >=2 durable 4-neighbours (metrics bit-identical to control (cluster 192, bricks 3141, gap 2366); branch never fires, so no effect)
- **reverted**: world.js: perishables rot at half rate in cells with >=2 durable 4-neighbours (cluster 201->197, brickCells 3155->3140, gap 2366->2366; no gain)
- **kept**: nodling.js BRICK_GRAB_BONUS 0.3: reward picking up a fired brick (cluster 205->209, bricks 3166->3164, gap 2366->2366, median 988->1095; single 8k sample, within noise)
- **reverted**: nodling.js WALL_RAISE_BONUS 0.4: reward completing a 3-high solid wall beside an existing structure (metrics bit-identical to control (cluster 204, bricks 3177, gap 2366); bonus never changed behaviour in 5k ticks, dead code)
- **reverted**: nodling.js COOP_BUILD_BONUS 0.3: extra reward for building onto a structure with another Nodling within 3 cells (cluster 226->207, brickCells 3183->3184, bench gap 2366->2308, medianFitness 1158->1115; target worse)
- **kept**: nodling.js CLAY_GATHER_BONUS 0.3: reward picking up clay while a fire burns within 6 cells (cluster 219 -> 220, brickCells 3193 -> 3193, gap 2366 -> 2366; within noise)
- **reverted**: brain.js mutateGenome plasticity-rate perturbation step 0.2 -> 0.3 (bench gap 2366->2257, medianFitness 1050->1334, cluster 207->184, bricks 3214->3209; target (gap) worse; single 4k sample)
- **reverted**: ENCLOSE_BONUS 0.4 -> 0.6 (metrics bit-identical to control (cluster 192, bricks 3240, gap 2366, median 956); bonus never changed behaviour)
- **reverted**: nodling.js HAUL_BONUS 0.3: extra build reward when material was hauled >=8 cells from pickup (cluster 225->223, brickCells 3243->3244, gap 2366->2289, medianFitness 970->874; target not better)
- **kept**: nodling.js FLEE_HEARD_BONUS 0.2: reward gaining distance from a predator while hearing a call (commSeparation 0.0232 -> 0.0336, cluster 223 -> 258, bench gap 2366 -> 2219 (-6%, inside guardrail); single 3k sample, within noise)
- **reverted**: nodling.js VILLAGE_BONUS 0.3: extra build reward when >=3 of 8 surrounding cells hold durable material (cluster 247->210, brickCells 3291->3290, bench gap 2219->2261, medianFitness 968->851; target worse)
- **reverted**: FLEE_HEARD_BONUS 0.2 -> 0.3 (commSeparation 0.0439->0.0103 (target worse); cluster 186->193, gap 2219->2289)
- **kept**: nodling.js SITE_BONUS 0.3: extra reward for an adjacent build within 6 cells of own previous build (cluster 181->209, brickCells 3312->3315, gap 2219->2258, median 983->1326, comm 0.0237->0.013; single 8k sample, within noise)
- **reverted**: nodling.js FOLLOW_HEARD_BONUS 0.15: hungry, no predator near, reward closing on a heard call (food-found->approach) (commSeparation 0.061->0.0438, cluster 235->186, gap 2258->2150, median 1180->1185; target worse)
- **reverted**: nodling.js BRICK_ROW_BONUS 0.3: extra reward for laying a brick beside another brick (3k ticks: metrics bit-identical to control (cluster 282, bricks 3330, gap 2258); no behavioural change)
- **kept**: world.js: base flora regrowth tries halved (16->8) in Winter (medianFitness 951->1109, gap 2258->2196 (-2.7%), cluster 286->286, bricks 3340->3338; single 8k sample, within noise)
- **kept**: world.js: flora regrowth acceptance 0.42 -> 0.30 in Summer (metrics identical to control (gap 2196, median 1113, cluster 298, bricks 3343); window days 930-935 is not Summer so the change never fired; effect unverified)
- **kept**: nodling.js BRIDGE_CROSS_BONUS 0.2: reward stepping from land onto a bridge tile (cluster/bricks identical, bench gap 2196 -> 2106 (noise); effect unverified)
- **reverted**: world.js flora regrowth acceptance 0.42 -> 0.55 in Autumn (medianFitness 1252 -> 1183, bench gap 2106 -> 2106, cluster 278 -> 276; no gain on target)
- **kept**: nodling.js HEARTH_BONUS 0.05: per-tick reward for warming up (body below comfort) beside a fire without standing in it (all metrics identical to control; the 8k window (days ~945-950) had no cold bodies near fires, effect unverified)
- **kept**: nodling.js HUNGRY_EAT_BONUS 0.3: reward eating found food while energy <60 (bench gap 2106 -> 2122, medianFitness 1291 -> 1246 (-3.5%); single 8k sample, within noise)
- **kept**: nodling.js breeding eligibility age 140 -> 110 (bench gap 2122 -> 2240, medianFitness 1075 -> 1081; within single-sample noise)
- **reverted**: breeding-eligibility age 110 -> 90 (bench gap 2240->2155 (-3.8%), medianFitness 1130->1136, cluster 227->231; main growth signal (gap) worse)
- **reverted**: nodling.js hungry-eat bonus window energy < 60 -> < 90 (bench gap 2240->2162, medianFitness 976->954, cluster 232->230, bricks 3398->3397, comm 0.0084->0.0206; target (gap) worse)
- **kept**: nodling.js KILN_SITE_BONUS 0.3: extra reward for feeding a kiln (clay beside fire) within 3 cells of an existing structure (all metrics identical to control in 8k ticks (bonus never fired or no effect); effect unverified, no harm)
- **reverted**: nodling.js EXPLORE_BONUS 0.05 for entering a new 8x8 region while energy < 100 (bench gap 2240 -> 2148, medianFitness 1167 -> 1056; growth signal worse)
- **reverted**: nodling.js WELL_BONUS 0.3: extra reward for drinking within 2 cells of a durable structure (largestCluster 303->192, bench gap 2240->2059, medianFitness 977->945; target worse)
- **reverted**: nodling.js PROVIDE_BONUS 0.2 for eating found food with a juvenile within 3 cells (bench gap 2240 -> 2141 (-4.4%), medianFitness 960 -> 1097, cluster 327 -> 379; growth target (gap) worse)
- **kept**: nodling.js mate choice: pick the fittest willing neighbour instead of the first (bench gap 2240 -> 2248, medianFitness 1056 -> 1074, largestCluster 395 -> 259; within single-sample noise)
- **reverted**: nodling.js ENDOW_ENERGY 25: parent with energy >150 transfers 25 energy to its newborn (bench gap 2248 -> 2044 (-9%), medianFitness 1199 -> 1143, largestCluster 391 -> 303, brickCells 3423 -> 3440)
- **reverted**: SPRING_BREED_BONUS 0.3 for breeding within 3 cells of water (gap 2248 -> 2200, others within noise)
- **reverted**: nodling.js APPRENTICE_BONUS 0.3: juvenile eating found food within 3 cells of an adult (bench gap 2248 -> 2161 (-3.9%), medianFitness 1041 -> 1163, largestCluster 235 -> 327, commSeparation 0.0336 -> 0.0223; growth target worse)
- **reverted**: nodling.js SHELTER_BONUS 0.03 per tick in a cell with >=2 durable neighbours while body temp outside comfort (bench gap 2248 -> 1994 (-11%), medianFitness 1100 -> 1099, largestCluster 302 -> 298, brickCells 3446 -> 3453; growth target worse)
- **reverted**: nodling.js THIRST_TOPUP_BONUS 0.1 for drinking at hydration 40-70 (bench gap 2248 -> 2190 (-2.6%), no gain on growth)
- **reverted**: nodling.js mate search radius 2 -> 4 cells (wider fittest-mate choice) (bench gap 2248 -> 2241 (-0.3%), medianFitness 1309 -> 1099, largestCluster 256 -> 288; growth target not better)
- **reverted**: nodling.js: asexual children of first-time breeders get a second mutateGenome round (bench gap 2248 -> 2012 (-10.5%), medianFitness 1001 -> 1016, largestCluster 284 -> 240; growth target worse)
- **reverted**: nodling.js FORAGE_SITE_BONUS 0.2 for eating within 6 cells of previous meal (bench gap 2248 -> 2010 (-10.6%), median 956 -> 947, cluster 295 -> 243; target worse)

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
