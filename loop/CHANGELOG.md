# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 98 — day 914.34 + 3k ticks (batch ran 12k; 25k timed out) — `reverted` (no effect) — `STRUCTURAL:`

Plateau: gap, medianFitness, brickCells flat. Hypothesis (priority 1): `BRICK_ROW_BONUS = 0.3`, extra build reward for laying a brick directly beside another brick. Baseline batch passed (gap 2258).
Control vs treatment (3k ticks): metrics bit-identical (largestCluster 282, brickCells 3330, gap 2258, medianFitness 1270, comm 0.0143, pop 500). No behavioural change in the window; reverted.

## Cycle 97 — day 906.84 + 8k ticks (batch ran 12.5k; 25k timed out) — `reverted` (target worse) — `STRUCTURAL:`

Plateau: gap, medianFitness, largestCluster, brickCells flat. Hypothesis (priority 2): `FOLLOW_HEARD_BONUS = 0.15`, reward for closing on a heard call when hungry and no predator is near (food-found -> approach). Baseline batch passed (gap 2258).
Control vs treatment (8k ticks): commSeparation 0.061 -> 0.0438, largestCluster 235 -> 186, brickCells 3325 -> 3329, gap 2258 -> 2150, medianFitness 1180 -> 1185, pop 500 -> 499. Guardrails passed but the target fell; reverted.

## Cycle 96 — day 899.03 + 8k ticks (batch ran full 25k) — `kept` — `STRUCTURAL:`

Plateau: gap, largestCluster, brickCells flat. Hypothesis (priority 1): `SITE_BONUS = 0.3` (nodling.js), extra reward for an adjacent build within 6 cells of the Nodling's previous build, so builders stay on one site. Baseline batch passed (gap 2219).
Control vs treatment (8k ticks): largestCluster 181 -> 209, brickCells 3312 -> 3315, builtCells 3772 -> 3841, gap 2219 -> 2258, medianFitness 983 -> 1326, comm 0.0237 -> 0.013, pop 500 -> 500. Guardrails pass; gains are within single-sample noise, comm dipped.

## Cycle 95 — day 883.41 + 3k ticks (batch ran 12k; 25k timed out) — `reverted` (target worse)

Plateau: gap, brickCells flat; tuning still productive. Hypothesis (priority 2): `FLEE_HEARD_BONUS` 0.2 -> 0.3. Baseline batch passed (gap 2219).
Control vs treatment (3k ticks): commSeparation 0.0439 -> 0.0103, largestCluster 186 -> 193, brickCells 3288 -> 3298, gap 2219 -> 2289, medianFitness 912 -> 995, pop 500 -> 499. Guardrails passed but the target fell (others within noise); reverted.

## Cycle 94 — day 875.91 + 3k ticks (batch ran 12k; 25k timed out) — `reverted` (target worse) — `STRUCTURAL:`

Plateau: structural cycle required. Hypothesis (priority 1): `VILLAGE_BONUS = 0.3` extra build reward when >=3 of the 8 surrounding cells hold durable material (dense villages, not lines). Baseline batch passed (gap 2219).
Control vs treatment (3k ticks): largestCluster 247 -> 210, brickCells 3291 -> 3290, builtCells 3712 -> 3661, gap 2219 -> 2261, medianFitness 968 -> 851, comm 0.008 -> 0.0029, pop 500 -> 502. Guardrails passed but the target fell; reverted.

## Cycle 93 — day 868.41 + 3k ticks (batch ran 12k; 25k timed out) — `kept` — `STRUCTURAL:`

Plateau: gap, medianFitness, largestCluster, brickCells flat. Hypothesis (priority 2): `FLEE_HEARD_BONUS = 0.2` (nodling.js), reward for gaining distance from the nearest predator while hearing a call, so alarm->flee is learnable. Baseline batch passed (gap 2366).
Control vs treatment (3k ticks): commSeparation 0.0232 -> 0.0336, largestCluster 223 -> 258, brickCells 3261 -> 3266, gap 2366 -> 2219, medianFitness 1108 -> 1059, pop 501 -> 501. Guardrails pass; gap dipped 6% and gains are within single-sample noise.

## Cycle 92 — day 860.91 + 4k ticks (batch ran 12k; 25k timed out) — `reverted` (target not better) — `STRUCTURAL:`

Plateau: gap, medianFitness, largestCluster, brickCells flat. Hypothesis (priority 1): `HAUL_BONUS = 0.3` extra build reward when the block was carried >=8 cells from its pickup (supply lines). Baseline batch passed (gap 2366).
Control vs treatment (4k ticks): largestCluster 225 -> 223, brickCells 3243 -> 3244, builtCells 3935 -> 3934, gap 2366 -> 2289, medianFitness 970 -> 874, comm 0.0247 -> 0.0472, pop 501 -> 500. Guardrails passed but no gain on target; reverted.

## Cycle 91 — day 853.41 + 4k ticks (batch ran 12k; 25k timed out) — `reverted` (no effect)

Plateau: gap, brickCells flat; tuning still productive. Hypothesis (priority 1): `ENCLOSE_BONUS` 0.4 -> 0.6. Baseline batch passed (gap 2366).
Control vs treatment (4k ticks): metrics bit-identical (largestCluster 192, brickCells 3240, gap 2366, medianFitness 956, comm 0.026, pop 500). No behavioural change; reverted.

## Cycle 90 — day 845.91 + 4k ticks (batch ran 12.5k; 25k timed out) — `reverted` (gap worse)

Plateau: gap, brickCells flat; tuning still productive. Hypothesis (priority 3): brain.js plasticity-rate perturbation step 0.2 -> 0.3. Baseline batch passed (gap 2366).
Control vs treatment (4k ticks): gap 2366 -> 2257, medianFitness 1050 -> 1334, largestCluster 207 -> 184, brickCells 3214 -> 3209, comm 0.0557 -> 0.0593, pop 501 -> 499. Guardrails passed but the target fell; reverted.

## Cycle 89 — day 838.09 + 4k ticks (batch ran 12k; 25k timed out) — `kept` — `STRUCTURAL:`

Plateau: gap, brickCells, maxGen flat. Added `CLAY_GATHER_BONUS = 0.3` (nodling.js): reward picking up clay with a fire within 6 cells, so kiln stocking is learnable. Baseline batch passed (gap 2366).
Control vs treatment (4k ticks): largestCluster 219 -> 220, brickCells 3193 -> 3193, builtCells (n/a) -> 3730, gap 2366 -> 2366, medianFitness 1203 -> 1207, comm 0.0445 -> 0.0208, pop 501. Guardrails pass; differences within noise.

## Cycle 88 — day 830.59 + 4k ticks (batch ran 10k; 25k timed out) — `reverted` (target worse) — `STRUCTURAL:`

Plateau: gap, medianFitness, brickCells, maxGen flat. Hypothesis (priority 1): `COOP_BUILD_BONUS = 0.3` for building onto a structure with another Nodling within 3 cells. Baseline batch passed (gap 2366).
Control vs treatment (4k ticks): largestCluster 226 -> 207, brickCells 3183 -> 3184, builtCells 3927 -> 4025, gap 2366 -> 2308, medianFitness 1158 -> 1115, pop 498 -> 499. Guardrails passed but the target slipped; reverted.

## Cycle 87 — day 824.3 + 5k ticks (batch ran 6k; 25k timed out) — `reverted` (no effect) — `STRUCTURAL:`

Plateau: gap, largestCluster, brickCells flat. Hypothesis (priority 1): `WALL_RAISE_BONUS = 0.4` for completing a 3-high solid wall beside an existing structure. Baseline batch passed (gap 2366).
Control vs treatment (5k ticks): metrics bit-identical (cluster 204, brickCells 3177, builtCells 3723, gap 2366, medianFitness 1029, pop 500). The bonus never altered behaviour; reverted as dead code. Note: runs take ~7 min each at 5-6k ticks.

## Cycle 86 — day 820.6 + 8k ticks (batch ran 12k; 25k timed out) — `kept` — `STRUCTURAL:`

Plateau: gap, largestCluster, brickCells flat. Added `BRICK_GRAB_BONUS = 0.3` (nodling.js): reward picking up a fired brick, so kiln output gets salvaged for walls.
Control vs treatment: cluster 205 -> 209, brickCells 3166 -> 3164, builtCells 3724 -> 3600, gap 2366 -> 2366, medianFitness 988 -> 1095, comm 0.0227 -> 0.0224. Guardrails pass; differences are within noise.

## Cycle 85 — day 813.09 + 8k ticks (batch ran 12.5k; 25k timed out) — `reverted` (no gain) — `STRUCTURAL:`

**Hypothesis** (priority 1; plateau.js demanded a structural cycle): granary — perishables (meat/cooked) rot at half rate in cells with >=2 durable 4-neighbours, so stores in villages last. Baseline batch passed (gap 2366).

- Control vs treatment (8k ticks): largestCluster 201 -> 197, brickCells 3155 -> 3140, bench gap 2366 -> 2366, medianFitness 1160 -> 1226, commSeparation 0.074 -> 0.082, pop 500. Guardrails passed but the target slipped (within noise); reverted.

## Cycle 84 — day 810.3 (batch ran 12.5k; 25k timed out) — `reverted` (no effect) — `STRUCTURAL:`

**Hypothesis** (priority 1; plateau.js demanded a structural cycle): kiln hearth — a kiln-lit fire with >=2 durable 4-neighbours burns 4 ticks longer, so kilns inside villages make more brick. Baseline batch passed (gap 2366).

- Control vs treatment (8k ticks): metrics bit-identical (largestCluster 192, brickCells 3141, gap 2366, medianFitness 1188, pop 501). The branch never triggers in practice (kiln sparks land away from walls), so nothing to keep; reverted as dead code.

## Cycle 83 — day 797.5 + 8k ticks — `reverted` — `STRUCTURAL:`

**Hypothesis** (priority 1; plateau.js demanded a structural cycle): walled garden — `floraCanGrow` also allows a bare cell with >=2 durable 4-neighbours to sprout flora, so food appears inside villages. Baseline batch passed (gap 2366).

- Control vs treatment (8k ticks): largestCluster 207 -> 207, brickCells 3133 -> 3128, bench gap 2366 -> 2075, medianFitness 913 -> 967, population 500 -> 500. Guardrails passed, but the target did not move and gap fell ~12%; reverted.

## Cycle 82 — day 786.8 — `reverted` — `STRUCTURAL:`

**Hypothesis** (priority 1/3, plateau.js demanded a structural cycle): walled shade — hydration drain halved for a Nodling with >=2 stacked 4-neighbours, so settling among walls is a survival affordance.

- Control vs treatment (8k ticks): largestCluster 219 -> 194, brickCells 3096 -> 3092, bench gap 2366 -> 2318, medianFitness 1020 -> 1082, thirst deaths 810 -> 366, population 500 -> 502. Guardrails passed, but the target metric fell, so reverted.

## Cycle 81 (A/B) — day 774.03 + 3k ticks (batch ran 12.5k) — `reverted` (enable-toggle probability 0.10 -> 0.14)

**Hypothesis** (priority #3; plateau.js: gap, brickCells flat, tuning still productive): `brain.js` mutateGenome connection enable-toggle probability 0.1 -> 0.14 (0.06 was reverted in cycle 71). Baseline batch passed (gap 2366).

Control -> treatment: bench gap 2366 -> 2170, medianFitness 1130 -> 967, largestCluster 296 -> 229, brickCells 3057 -> 3068, commSeparation 0.027 -> 0.032, pop 499 -> 500. Guardrails passed but the target (gap) fell ~8%; reverted.

## Cycle 80 (A/B) — day 766.22 + 5k ticks (batch ran 12.5k) — `STRUCTURAL: reverted` (night shelter bonus)

**Hypothesis** (priority #1; plateau.js: gap, medianFitness, brickCells flat -> structural): `SHELTER_NIGHT_BONUS = 0.05` per tick at night when standing with >=2 durable neighbours, so walls become a learnable shelter. Baseline batch passed (gap 2366).

Control -> treatment: largestCluster 288 -> 277, brickCells 3042 -> 3042, bench gap 2366 -> 2177, medianFitness 878 -> 895, commSeparation 0.054 -> 0.042, pop 500 -> 501. Guardrails passed but target (cluster) and gap fell; reverted.

## Cycle 79 (A/B) — day 758.41 + 8k ticks (batch ran 12.5k; 25k timed out) — `kept` (MAX_HIDDEN 60 -> 80)

**Hypothesis** (priority #3; plateau.js: gap, brickCells flat, tuning still productive): `brain.js` MAX_HIDDEN 60 -> 80 to give evolved brains headroom. Baseline batch passed (gap 2365).

Control -> treatment: bench gap 2365 -> 2366, medianFitness 1034 -> 1099, largestCluster 209 -> 203, brickCells 3036 -> 3036, commSeparation 0.173 -> 0.141, pop 500 -> 501. Guardrails passed; target equal, all differences within noise (the cap rarely binds at this horizon).

## Cycle 78 (A/B) — day 750.59 + 8k ticks (batch ran 12.5k; 25k timed out) — `reverted` (memory-cell mutation probability 0.14 -> 0.10)

**Hypothesis** (priority #3; plateau.js: gap, brickCells flat, tuning still productive): `brain.js` mutateGenome memory-cell mutation probability 0.14 -> 0.10 (0.20 was reverted in cycle 72). Baseline batch passed (gap 2365).

Control -> treatment: bench gap 2365 -> 2132, medianFitness 1131 -> 1128, largestCluster 125 -> 199, brickCells 3005 -> 3024, commSeparation 0.098 -> 0.137, pop 500 -> 500. Guardrails passed but the target (gap) fell ~10%; reverted (cluster rise is within run-to-run noise).

## Cycle 77 (A/B) — day 742.78 + 5k ticks (batch ran 12.5k; 25k timed out) — `reverted` (add-node probability 0.16 -> 0.12)

**Hypothesis** (priority #3; plateau.js: gap, brickCells flat, tuning still productive): `brain.js` mutateGenome add-node (split) probability 0.16 -> 0.12 (0.22 was reverted in cycle 70). Baseline batch passed (gap 2365).

Control -> treatment: bench gap 2365 -> 2109, medianFitness 1110 -> 1134, largestCluster 173 -> 171, brickCells 2980 -> 2985, commSeparation 0.142 -> 0.096, pop 502 -> 501. Guardrails passed but the target (gap) fell ~11%; reverted.

## Cycle 76 (A/B) — day 735 + 3k ticks (batch ran 12.5k) — `STRUCTURAL: kept` (nest-breed bonus)

**Hypothesis** (priority #1; plateau.js: gap, medianFitness, brickCells flat -> structural): `NEST_BREED_BONUS = 0.5` in `nodling.js`, extra reward to a parent that breeds inside a cluster of >=4 stacked cells, so settling in villages is reinforced (previously only the child got energy).

Control -> treatment: largestCluster 170 -> 173, brickCells 2952 -> 2952, bench gap 2337 -> 2365, medianFitness 1138 -> 1055, commSeparation 0.229 -> 0.191, pop 501 -> 500. Guardrails passed; target equal/slightly better, all differences within noise.

## Cycle 75 (A/B) — day 727.16 + 3k ticks (batch ran 6.25k; 25k and 12.5k timed out) — `STRUCTURAL: reverted` (hunger-eat bonus)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness, brickCells flat -> structural): `HUNGER_EAT_BONUS = 0.3` in `nodling.js`, reward for eating found food while energy < 50. Baseline batch passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2190, medianFitness 1167 -> 1103, largestCluster 163 -> 167, brickCells 2933 -> 2942, commSeparation 0.230 -> 0.197, pop 501 -> 502. Guardrails passed but the target (gap) fell ~6%; reverted.

## Cycle 74 (A/B) — day 723.25 + 8k ticks (batch ran 12.5k; 25k timed out) — `STRUCTURAL: reverted` (communal build bonus)

**Hypothesis** (priority #1; plateau.js: gap, medianFitness, brickCells flat -> structural): `COMMUNAL_BUILD_BONUS = 0.3` in `nodling.js`, extra reward for adding to a structure with another Nodling within 3 cells (shared villages). Baseline batch passed (gap 2337).

Control -> treatment: largestCluster 166 -> 141, brickCells 2938 -> 2927, bench gap 2337 -> 2250, medianFitness 883 -> 1008, commSeparation 0.186 -> 0.160, pop 498 -> 501. Guardrails passed but the target (cluster) fell; reverted.

## Cycle 73 (A/B) — day 715.44 + 5k ticks (batch ran 12.5k; 25k timed out) — `reverted` (weight perturbation step 0.3 -> 0.4)

**Hypothesis** (priority #3; plateau.js: gap flat, tuning still productive): `brain.js` mutateGenome weight perturbation step 0.3 -> 0.4. Baseline batch passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2227, medianFitness 1062 -> 1015, largestCluster 75 -> 88, brickCells 2895 -> 2906, commSeparation 0.2832 -> 0.2756, pop 502 -> 499. Guardrails passed but the target (gap) fell ~5%; reverted.

## Cycle 72 (A/B) — day 707.63 + 5k ticks (batch ran 12.5k; 25k times out) — `reverted` (memory-cell mutation probability 0.14 -> 0.20)

**Hypothesis** (priority #3; plateau.js: gap and brickCells flat, tuning still productive): `brain.js` mutateGenome memory-cell mutation probability 0.14 -> 0.20. Baseline batch passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2215, medianFitness 1121 -> 1056, largestCluster 88 -> 78, brickCells 2861 -> 2868, commSeparation 0.1036 -> 0.0991, pop 499 -> 500. Guardrails passed but the target (gap) fell ~5%; reverted.

## Cycle 71 (A/B) — day 699.81 + 8k ticks (batch ran 12.5k; 25k timed out) — `reverted` (connection enable-toggle probability 0.1 -> 0.06)

**Hypothesis** (priority #3; plateau.js: gap and largestCluster flat, tuning still productive): `brain.js` mutateGenome enable-toggle probability 0.1 -> 0.06. Baseline batch passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2178, medianFitness 1096 -> 1064, largestCluster 73 -> 87, brickCells 2845 -> 2855, commSeparation 0.203 -> 0.269, pop 500 -> 500. Guardrails passed but the target (gap) fell ~7%; reverted.

## Cycle 70 (A/B) — day 692 + 8k ticks (batch ran 12.5k; 25k timed out) — `reverted` (add-node probability 0.16 -> 0.22)

**Hypothesis** (priority #3; plateau.js: gap flat, tuning still productive): `brain.js` mutateGenome add-node (split) probability 0.16 -> 0.22. Baseline batch passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2195, medianFitness 1015 -> 1135, largestCluster 78 -> 65, brickCells 2822 -> 2821, commSeparation 0.210 -> 0.305, pop 500 -> 499. Guardrails passed but the target (gap) fell ~6%; reverted.

## Cycle 69 (A/B) — day 684.19 + 5k ticks — `reverted` (add-connection probability 0.28 -> 0.35)

**Hypothesis** (priority #3; plateau.js: gap and medianFitness flat, tuning still productive): `brain.js` mutateGenome add-connection probability 0.28 -> 0.35 (0.2 was reverted in cycle 65). Baseline batch (25k ticks) passed (gap 2337).

Control -> treatment: bench gap 2337 -> 2185, medianFitness 893 -> 949, largestCluster 102 -> 109, brickCells 2800 -> 2798, commSeparation 0.206 -> 0.217, pop 499 -> 500. Guardrails passed but the target (gap) fell ~6.5%; reverted.

## Cycle 68 (A/B) — day 668.56 + 5k ticks (batch ran 6.25k; 25k and 12.5k timed out) — `STRUCTURAL: kept` (hunt bonus)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness, largestCluster flat -> structural): `HUNT_BONUS = 0.4` in `nodling.js` rewards striking down a critter, making hunting a learnable food source. Baseline batch passed (gap 2343).

Control -> treatment: bench gap 2343 -> 2337, medianFitness 1050 -> 989, largestCluster 76 -> 88, brickCells 2722 -> 2714, commSeparation 0.134 -> 0.070, pop 501 -> 502. Guardrails passed; gap is flat (-0.3%), all differences within noise.

## Cycle 67 (A/B) — day 664.66 + 5k ticks (batch ran 12.5k; 25k timed out) — `reverted` (plasticity mutation probability 0.3 -> 0.45)

**Hypothesis** (priority #3; plateau.js: gap and largestCluster flat, tuning still productive): `brain.js` mutateGenome plasticity-rate mutation probability 0.3 -> 0.45 (0.15 was reverted in cycle 61). Baseline batch passed (gap 2343).

Control -> treatment: bench gap 2343 -> 2185, medianFitness 1141 -> 1015, largestCluster 151 -> 72, brickCells 2699 -> 2719, commSeparation 0.0667 -> 0.1137. Guardrails passed but the target (gap) fell ~7%; reverted.

## Cycle 66 — day 656.8 + 8k ticks — `STRUCTURAL: kept`

Plateau.js demanded a structural cycle. Baseline batch (12.5k ticks; 25k timed out) passed. Added `ENCLOSE_BONUS = 0.4` in `nodling.js`: extra reward for placing durable material in a gap with >=2 durable neighbours (dense villages, not lines).
Control -> treatment: largestCluster 70 -> 80, brickCells 2686 -> 2678, builtCells 3041 -> 3102, bench gap 2357 -> 2343, medianFitness 1007 -> 957, commSeparation 0.167 -> 0.047. Guardrails passed; single 8k sample, within noise.

## Cycle 65 (A/B) — day 649.03 + 5k ticks (batch ran 12.5k; 25k timed out) — `reverted` (add-connection probability 0.28 -> 0.2)

**Hypothesis** (priority #3; plateau.js: gap flat, tuning still productive): `brain.js` mutateGenome add-connection probability 0.28 -> 0.2 to limit brain bloat. Baseline batch passed (gap 2357).

Control -> treatment: bench gap 2357 -> 2132, medianFitness 1103 -> 853, largestCluster 156 -> 62, brickCells 2645 -> 2640, commSeparation 0.0471 -> 0.0701, pop 456 -> 500. Guardrails passed but the target (gap) fell ~10%; reverted.

## Cycle 64 (A/B) — day 641.22 + 5k ticks (batch ran 12.5k; 25k timed out) — `kept` (STRUCTURAL: thirst-drink bonus)

**Hypothesis** (priority #3; plateau.js: gap, largestCluster, brickCells flat -> structural): `THIRST_DRINK_BONUS = 0.3` in `nodling.js` rewards drinking while hydration < 40, so thirst management is learnable (649 thirst deaths). Baseline batch passed (gap 2357).

Control -> treatment: all metrics identical (gap 2357, median 1133, cluster 76, bricks 2605, comm 0.1, pop 500). The bonus did not alter any trajectory in 5k ticks; null result, no evidence of effect.

## Cycle 63 (A/B) — day 633.41 + 5k ticks (batch ran 12.5k) — `reverted` (weight mutation probability 0.5 -> 0.35)

**Hypothesis** (priority #3; plateau.js: gap flat, tuning still productive): `brain.js` mutateGenome per-connection weight mutation probability 0.5 -> 0.35. Baseline batch passed (gap 2357).

Control -> treatment: bench gap 2357 -> 2161, medianFitness 1049 -> 1194, largestCluster 82 -> 95, brickCells 2577 -> 2583, commSeparation 0.0164 -> 0.0106, pop 500 -> 502. Guardrails passed but the target (gap) fell ~8%; reverted.

## Cycle 62 (A/B) — day 625.59 + 5k ticks (batch ran 6.25k) — `reverted` (weight mutation step 0.3 -> 0.2)

**Hypothesis** (priority #3; plateau.js: gap flat, tuning still productive): `brain.js` mutateGenome weight step 0.3 -> 0.2. Baseline batch passed (gap 2357).

Control -> treatment: bench gap 2357 -> 2204, medianFitness 1247 -> 955, largestCluster 49 -> 55, brickCells 2562 -> 2556, commSeparation 0.0123 -> 0.0585, pop 499. Guardrails passed but the target (gap) fell ~6%; reverted.

## Cycle 61 (A/B) — day 621.69 + 5k ticks (batch ran 12.5k) — `reverted` (plasticity mutation 0.3 -> 0.15)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness flat): `brain.js` mutateGenome plasticity-rate mutation probability 0.3 -> 0.15. Baseline batch passed (gap 2357).

Control -> treatment: bench gap 2357 -> 2256, medianFitness 1068 -> 1187, largestCluster 41 -> 82, brickCells 2530 -> 2534, commSeparation 0.0296 -> 0.0464, pop 500 -> 501. Guardrails passed but the target (gap) fell ~4%; reverted.

## Cycle 60 (A/B) — day 613.88 + 5k ticks (batch ran 12.5k) — `kept` (STRUCTURAL: shared-meal bonus)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness, largestCluster flat -> structural): `SHARED_MEAL_BONUS = 0.3` in `nodling.js` rewards eating found food with another Nodling within 3 cells, a group-foraging pressure. Baseline batch passed (gap 2344).

Control -> treatment: bench gap 2344 -> 2357, medianFitness 946 -> 1012, largestCluster 42 -> 41, brickCells 2488 -> 2490, commSeparation 0.0556 -> 0.0046, pop 501 -> 501. Guardrails passed; target (gap) marginally better, all within noise (comm fell, not the target here).

## Cycle 59 (A/B) — day 606.06 + 5k ticks (batch ran 12k) — `kept` (STRUCTURAL: smaller weight-mutation step)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness flat): weight mutation step 0.4 -> 0.3 (`brain.js` mutateGenome) so offspring perturb proven weights less. Baseline batch passed (gap 2308).

Control -> treatment: bench gap 2308 -> 2344, medianFitness 770 -> 1051, largestCluster 50 -> 57, brickCells 2441 -> 2436, commSeparation 0.0086 -> 0.0249, pop 498 -> 499. Guardrails passed; target equal/better, single sample, within noise.

## Cycle 58 (A/B) — day 598.56 + 5k ticks (batch ran 12k) — `kept` (STRUCTURAL: gentler weight mutation)

**Hypothesis** (priority #3; plateau.js: gap flat): per-connection weight mutation probability 0.8 -> 0.5 (`brain.js`), so offspring keep more of proven parents' tuning. Baseline batch passed.

Control -> treatment: bench gap 2296 -> 2308, medianFitness 1173 -> 1106, largestCluster 76 -> 55, brickCells 2395 -> 2396, commSeparation 0.0184 -> 0.0375, pop 501 -> 502. Guardrails passed; target (gap) marginally better, within noise (cluster fell, not the target here).

## Cycle 57 (A/B) — day 591.06 + 5k ticks — `reverted`

**Hypothesis** (priority #3, gap plateau): breeding energy threshold 115 -> 100 (`nodling.js`) for faster turnover. Batch (12k ticks, 25k timed out) passed guardrails.

| | control | treatment |
|---|---|---|
| benchmark gap | 2296 | 2186 |
| medianFitness | 940 | 1026 |
| largestCluster | 60 | 69 |
| brickCells | 2355 | 2351 |

Guardrails passed but the target (gap) fell ~5%; reverted.

## Cycle 55 (A/B) — day 583.56 + 5k ticks (batch ran 6.25k) — `reverted` (STRUCTURAL: harsher winters)

**Hypothesis** (priority #3; plateau.js: gap, medianFitness, maxGen flat): seasonal ambient amplitude 10 -> 12 (4..28°) as environmental pressure to widen the fitness landscape. Baseline batch passed (gap 2296).

Control -> treatment: bench gap 2296 -> 1882 (-18%), medianFitness 1158 -> 1019, largestCluster 42 -> 63, brickCells 2296 -> 2319, builtCells 2760 -> 2692, commSeparation 0.0687 -> 0.0903, pop 500 -> 501. Guardrails passed but target (gap) clearly worse; reverted.

## Cycle 54 (A/B) — day 579.66 + 5k ticks (batch ran 6.25k) — `kept` (STRUCTURAL: bridge-extension bonus)

**Hypothesis** (priority #1; plateau.js: gap, cluster, bricks, maxGen flat): reward (`BRIDGE_BONUS` 0.4) laying a bridge tile on water next to an existing bridge tile, so bridge chains extend. Baseline batch passed (gap 2300).

Control -> treatment: largestCluster 40 -> 48, brickCells 2239 -> 2241, builtCells 2923 -> 2935, bench gap 2300 -> 2296, medianFitness 1036 -> 1052, commSeparation 0.1295 -> 0.0004 (very noisy), pop 502 -> 500. Guardrails passed; target equal/better, single sample, within noise.

## Cycle 53 (A/B) — day 575.75 + 5k ticks (batch ran 6.25k) — `kept` (STRUCTURAL: brick-wall bonus)

**Hypothesis** (priority #1; plateau.js: gap, cluster, bricks, maxGen flat): extra reward (`BRICK_WALL_BONUS` 0.5) for placing a fired brick next to an existing durable structure, so brick chains extend walls. Baseline batch passed (gap 2300).

Control -> treatment: largestCluster 39 -> 40, brickCells 2217 -> 2229, builtCells 3029 -> 2848, bench gap 2300 -> 2300, medianFitness 1148 -> 1207, commSeparation 0.0322 -> 0.0861, pop 499 -> 500. Guardrails passed; target equal/slightly better, within noise.

## Cycle 52 (A/B) — day 572 + 5k ticks (batch ran 6.25k) — `reverted` (STRUCTURAL: follow-the-call food bonus)

**Hypothesis** (priority #2; plateau.js demanded STRUCTURAL: gap, bricks, maxGen flat): reward eating ground food within 60 ticks of hearing a non-alarm call (`FOLLOW_BONUS` 0.3), so food-found calls pay the listener. Baseline batch passed (gap 2300).

Control -> treatment: commSeparation 0.0698 -> 0.0012, bench gap 2300 -> 2267, medianFitness 1053 -> 1069, largestCluster 35 -> 39, brickCells 2204 -> 2202, builtCells 2732 -> 2916, pop 500 -> 504. Guardrails passed but target (comm) worse, though comm is very noisy; reverted.

## Cycle 51 (A/B) — day 568 + 5k ticks (batch ran 6.25k) — `kept` (STRUCTURAL: breeding energy gate 130 -> 115)

**Hypothesis** (priority #3; plateau.js: gap and medianFitness flat): lower the energy needed to be breeding-eligible so more individuals reproduce. (`REPRO_THRESHOLD` in RULES.md no longer exists in code; literal edited in nodling.js.) Baseline batch passed (gap 2237).

Control -> treatment: bench gap 2237 -> 2300, medianFitness 1255 -> 1195, largestCluster 40 -> 42, brickCells 2192 -> 2198, builtCells 2622 -> 2661, commSeparation 0.0292 -> 0.009, pop 500 -> 499. Guardrails passed; single 5k sample, within noise.

## Cycle 50 (A/B) — day 567.2 + 5k ticks (batch ran 6.25k) — `reverted` (LEARN_RATE 0.025 -> 0.022)

**Hypothesis** (priority #3; plateau.js: gap and medianFitness flat, tuning allowed): slightly slower plasticity. Baseline batch passed (gap 2237).

Control -> treatment: bench gap 2237 -> 2205, medianFitness 1120 -> 776 (-30.7%, tripped guardrail), largestCluster 68 -> 45, brickCells 2178 -> 2198, builtCells 2612 -> 2518, commSeparation 0.0238 -> 0.0195, pop 500 -> 499. Reverted. LEARN_RATE is exhausted around 0.025.

## Cycle 49 (A/B) — day 560.1 + 5k ticks (batch ran 6.25k: 25k timed out) — `reverted` (POP_CAP 500 -> 600)

**Hypothesis** (priority #3; plateau.js: gap and cluster flat, tuning allowed): larger population widens the search. Baseline batch passed (gap 2237).

Control -> treatment: bench gap 2237 -> 2234, medianFitness 1247 -> 1076, largestCluster 41 -> 38, brickCells 2179 -> 2187, builtCells 2566 -> 2561, commSeparation 0.0236 -> 0.0095, pop 500 -> 600. Guardrails passed, no gain on target and the 5k run took 6m08, so reverted. POP_CAP is exhausted at 500.

## Cycle 48 (A/B) — day 556.2 + 8k ticks (batch ran 6.25k) — `reverted` (LISTEN_BONUS 0.15 -> 0.2)

**Hypothesis** (priority #2; plateau.js: gap and cluster flat, tuning allowed): intermediate listen bonus between 0.15 and the reverted 0.1/0.3. Baseline batch passed (gap 2237).

Control -> treatment: commSeparation 0.0564 -> 0.0066, largestCluster 38 -> 40, brickCells 2170 -> 2167, builtCells 2501 -> 2627, bench gap 2237 -> 2316, medianFitness 941 -> 1159, pop 502 -> 503. Guardrails passed, but target worse (single sample, comm is very noisy); reverted. LISTEN_BONUS is exhausted as a knob.

## Cycle 47 (A/B) — day 552.3 + 5k ticks (batch ran 6.25k: 25k timed out) — `reverted` (LISTEN_BONUS 0.15 -> 0.1)

**Hypothesis** (priority #2; plateau.js: gap and cluster flat, tuning allowed): a smaller listen bonus might make the alarm correlation cleaner (0.3 was reverted in cycle 20). Baseline batch passed (gap 2237).

Control -> treatment: commSeparation 0.0586 -> 0.0358, largestCluster 45 -> 45, brickCells 2120 -> 2103, builtCells 2446 -> 2531, bench gap 2237 -> 2237, medianFitness 1057 -> 1205, pop 500 -> 497. Guardrails passed, but target worse (single sample, possibly noise); reverted.

## Cycle 46 (A/B) — day 551.5 + 5k ticks (batch ran 6.25k: 25k and 12.5k timed out) — `reverted` (tidal clay 0.3 -> 0.4)

**Hypothesis** (priority #1; plateau.js: only gap flat, tuning allowed): more shoreline clay deposits. Baseline batch passed (gap 2237).

Control -> treatment: largestCluster 42 -> 32, brickCells 2074 -> 2097, builtCells 2547 -> 2484, bench gap 2237 -> 2164, medianFitness 1195 -> 860 (-28%, tripped guardrail), commSeparation 0.0155 -> 0.0569, pop 501 -> 500. Reverted; target worse. Note: batches now need ~6k ticks to fit the 10-min limit.

## Cycle 45 (A/B) — day 544.5 + 8k ticks — `kept` (POP_CAP 400 -> 500)

**Hypothesis** (priority #3; plateau.js: gap and medianFitness flat, tuning allowed): more individuals widen the search and the builder pool. Baseline batch passed (gap 2274).

Control -> treatment: largestCluster 33 -> 36, brickCells 2065 -> 2048, builtCells ? -> 2669, bench gap 2274 -> 2237, medianFitness 911 -> 1150, commSeparation 0.0461 -> 0.0406, pop 400 -> 501. Guardrails passed. Single 8k sample, differences within noise. Runtime: the 8k treatment took ~4m48, so next batches should use fewer ticks (e.g. 12.5k).

## Cycle 44 (A/B) — day 528.9 + 8k ticks (batch ran 25k) — `kept` (LEARN_RATE 0.03 -> 0.025)

**Hypothesis** (priority #3; plateau.js: gap and medianFitness flat): slightly slower plasticity may stabilise learned behaviour (0.04 reverted in cycle 32). Baseline batch passed (gap 2260).

Control -> treatment: largestCluster 48 -> 54, brickCells 1957 -> 1966, builtCells 2313 -> 2384, bench gap 2260 -> 2274, medianFitness 1054 -> 1107, commSeparation 0.0028 -> 0.0332, pop 400 -> 400. Guardrails passed. Single 8k sample, differences within noise.

## Cycle 43 (A/B) — day 513.3 + 16k ticks (batch ran 12.5k: 80k timed out) — `reverted` (FIRE_SPREAD_RATE 0.18 -> 0.2)

**Hypothesis** (priority #1; plateau.js: gap and medianFitness flat, tuning allowed): final step of the fire-spread ramp (range max). Baseline batch passed (gap 2260).

Control -> treatment: largestCluster 44 -> 33, brickCells 1876 -> 1905, builtCells 2281 -> 2300, bench gap 2260 -> 2255, medianFitness 1325 -> 1254, commSeparation 0.0009 -> 0.022, pop 401 -> 401. Guardrails passed, but target cluster fell (single sample, possibly noise); reverted. Fire-spread ramp is exhausted.

## Cycle 42 (A/B) — day 505.4 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (FIRE_SPREAD_RATE 0.15 -> 0.18)

**Hypothesis** (priority #1; plateau.js: only gap flat, tuning allowed): continue the fire-spread ramp. Baseline batch passed (gap 2239).

Control -> treatment: largestCluster 33 -> 33, brickCells 1760 -> 1774, builtCells 2245 -> 2264, bench gap 2239 -> 2260, medianFitness 823 -> 932, commSeparation 0.1283 -> 0.0582, pop 402 -> 402. Guardrails passed. Target metric equal; all differences within noise (single 8k sample).

## Cycle 41 (A/B) — day 497.6 + 8k ticks (batch ran 12.5k: 80k and 25k timed out) — `kept` (FIRE_SPREAD_RATE 0.12 -> 0.15)

**Hypothesis** (priority #1; plateau.js: gap and medianFitness flat, cluster/bricks rising, tuning allowed): continue the fire-spread ramp that raised cluster in cycle 40. Baseline batch passed (gap 2264).

Control -> treatment: largestCluster 27 -> 36, brickCells 1673 -> 1707, builtCells 2100 -> 2099, bench gap 2264 -> 2239, medianFitness 1194 -> 1139, commSeparation 0.0026 -> 0.0202, pop 403 -> 400. Guardrails passed. Single 8k sample, differences within noise.

## Cycle 40 (A/B) — day 489.8 + 8k ticks — `kept` (FIRE_SPREAD_RATE 0.09 -> 0.12)

**Hypothesis** (priority #1; plateau.js: only benchmark.gap flat, tuning allowed): wider fires give more clay a chance to fire into brick. Baseline batch passed (gap 2275).

Control -> treatment: largestCluster 16 -> 22, brickCells 1591 -> 1612, builtCells 2016 -> 2042, bench gap 2275 -> 2264, medianFitness 1263 -> 1163, commSeparation 0.0096 -> 0.0081, pop 400 -> 401. Guardrails passed. Single 8k sample, differences within noise.

## Cycle 39 (A/B) — day 474.2 + 8k ticks — `STRUCTURAL: kept` (predator shelter)

**Hypothesis** (priority #1; plateau.js: gap, medianFitness, largestCluster flat): a payoff for walls — predators cannot catch prey standing in a cell with >=2 durable neighbours. Baseline batch passed (gap 2324).

Control -> treatment: all metrics identical (largestCluster 16, brickCells 1413, builtCells 2136, gap 2275, medianFitness 850, comm 0.0182). Guardrails passed. Null result: the shelter case never changed an outcome in 8k ticks (prey is rarely walled in while a predator is within catch range); kept as harmless.

## Cycle 38 (A/B) — day 458.6 + 8k ticks (batch ran 12.5k: 25k timed out) — `reverted` (tidal clay chance 0.3 -> 0.5)

**Hypothesis** (priority #1; plateau.js: only benchmark.gap flat): more shoreline clay. Baseline batch passed (gap 2324).

Control -> treatment: largestCluster 17 -> 15, brickCells 1288 -> 1316, builtCells 1658 -> 1719, bench gap 2324 -> 2190, medianFitness 1051 -> 1147, commSeparation 0.026 -> 0.100. Guardrails passed, but cluster and gap fell (within noise); reverted. Clay supply looks saturated near 0.3.

## Cycle 37 (A/B) — day 450.7 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (tidal clay chance 0.15 -> 0.3)

**Hypothesis** (priority #1; plateau.js: only medianFitness flat): more shoreline clay feeds brick chains (0.05 -> 0.15 raised bricks in cycle 27). Baseline batch passed (gap 2332).

Control -> treatment: largestCluster 10 -> 14, brickCells 1147 -> 1167, builtCells 1696 -> 1759, bench gap 2332 -> 2324, medianFitness 1221 -> 1113, commSeparation 0.0076 -> 0.0815, pop 400 -> 402. Guardrails passed. Single 8k sample, differences within noise.

## Cycle 36 (A/B) — day 442.9 + 8k ticks (batch ran 12.5k: 25k timed out) — `reverted` (BUILD_ADJACENT_BONUS 0.85 -> 1.0)

**Hypothesis** (priority #1; plateau.js: only medianFitness flat): continue the bonus ramp. Baseline batch passed (gap 2332).

Control -> treatment: largestCluster 12 -> 11, brickCells 1097 -> 1079, builtCells 1742 -> 1785, bench gap 2332 -> 2283, medianFitness 1221 -> 1140, commSeparation 0.02 -> 0.079. Guardrails passed, but target slightly worse (within noise); reverted. 0.85 looks like the plateau of this knob.


## Cycle 35 (A/B) — day 435.1 + 8k ticks — `kept`

**Hypothesis** (priority #1): `BUILD_ADJACENT_BONUS` 0.7 -> 0.85. Plateau check: only `largestCluster` flat, so a tunable step is allowed.

Control -> treatment: largestCluster 12 -> 14, brickCells 1042 -> 1058, builtCells 1489 -> 1455, bench gap 2341 -> 2332, medianFitness 1038 -> 1028, commSeparation 0.056 -> 0.096, pop 401 -> 402. Guardrails passed. Single 8k sample, within noise.

## Cycle 34 (A/B) — day 432.6 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (BUILD_ADJACENT_BONUS 0.5 -> 0.7)

**Hypothesis** (priority #1; plateau.js: nothing plateaued): 0.9 reverted (cycle 13), 0.5 kept (cycle 33); try 0.7. Baseline batch passed (gap 2257).

| | control | treatment |
|---|---|---|
| largestCluster | 8 | 11 |
| brickCells | 962 | 980 |
| builtCells | 1405 | 1380 |
| benchmark gap | 2257 | 2341 |
| medianFitness | 1177 | 1192 |
| commSeparation | 0.0081 | 0.0383 |

Guardrails passed; target and others equal or better, but single 8k sample so within noise. Revert if cluster falls back to <= 9 over the next batches.

## Cycle 33 (A/B) — day 419.8 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (BUILD_ADJACENT_BONUS 0.3 -> 0.5)

**Hypothesis** (priority #1; plateau.js: only medianFitness flat): 0.9 was too much (cycle 13), try the midpoint. Baseline batch passed (gap 2318).

| | control | treatment |
|---|---|---|
| largestCluster | 8 | 9 |
| brickCells | 897 | 903 |
| benchmark gap | 2318 | 2257 |
| medianFitness | 1297 | 1157 |
| commSeparation | 0.045 | 0.0334 |

Guardrails passed. Target metrics equal/slightly better, but all differences are within noise (single 8k sample); gap, median and comm slipped a little. Revert if cluster does not stay above ~10 over the next batches.

## Cycle 32 (A/B) — day 412 + 8k ticks (batch ran 12.5k) — `reverted` (LEARN_RATE 0.03 -> 0.04)

**Hypothesis** (priority #3; plateau.js: only medianFitness flat): push the learning rate further after cycle 31. Baseline batch passed (gap 2318).

| | control | treatment |
|---|---|---|
| benchmark gap | 2318 | 2273 |
| medianFitness | 1047 | 1175 |
| largestCluster | 13 | 10 |
| brickCells | 847 | 832 |
| commSeparation | 0.0411 | 0.0071 |

Guardrails passed, but gap and cluster fell and comm dropped; only median rose (within noise). Reverted.

## Cycle 31 (A/B) — day 404.2 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (LEARN_RATE 0.02 -> 0.03)

**Hypothesis** (priority #3; plateau.js: only benchmark.gap flat): faster Hebbian learning (`brain.js`) to lift the gap. Baseline batch passed (gap 2110).

| | control | treatment |
|---|---|---|
| benchmark gap | 2110 | 2318 |
| largestCluster | 9 | 14 |
| brickCells | 779 | 790 |
| medianFitness | 1084 | 1332 |
| commSeparation | 0.0098 | 0.0165 |

Guardrails passed; every metric equal or better. Single 8k sample, so partly noise; watch the next batches.

## Cycle 30 (A/B) — day 396.4 + 8k ticks — `kept` (alarm call bonus 0.75 -> 1.0)

**Hypothesis** (priority #2; plateau.js: tuning still productive, only benchmark.gap flat): raise the alarm-call bonus when a predator is near (`nodling.js`). Baseline batch passed (gap 2256).

| | control | treatment |
|---|---|---|
| commSeparation | 0.0153 | 0.0158 |
| benchmark gap | 2256 | 2110 |
| largestCluster | 8 | 8 |
| brickCells | 685 | 673 |
| medianFitness | 1418 | 1079 |

Guardrails passed. Target +3% (within noise); gap -6% and median -24% (just inside the 25% guardrail), so do not push this knob further.

## Cycle 29 (A/B) — day 380.8 + 8k ticks — `kept` (alarm call bonus 0.5 -> 0.75)

**Hypothesis** (priority #2; plateau.js: tuning still productive; commSeparation ~0.0007 after the batch): raise the alarm-call bonus when a predator is near (`nodling.js`). Baseline batch passed (gap 2120).

| | control | treatment |
|---|---|---|
| commSeparation | 0.0194 | 0.0228 |
| benchmark gap | 2120 | 2256 |
| largestCluster | 8 | 7 |
| brickCells | 496 | 488 |
| medianFitness | 1115 | 1096 |

Guardrails passed. Target and gap up, cluster -1; all within single-sample noise.

## Cycle 28 (A/B) — day 365.1 + 8k ticks (batch ran 12.5k) — `reverted` (STRUCTURAL: build bonus per neighbour)

**Hypothesis** (priority #1; plateau.js demanded a structural cycle: gap, medianFitness, largestCluster flat): pay `BUILD_ADJACENT_BONUS` once per durable neighbour (up to 4x) instead of once, to reward compact filled-in clusters. Baseline batch passed (gap 2120).

| | control | treatment |
|---|---|---|
| largestCluster | 6 | 5 |
| brickCells | 305 | 267 |
| builtCells | 634 | 712 |
| benchmark gap | 2120 | 2103 |
| medianFitness | 936 | 1149 |

Guardrails passed but the target (largestCluster) got worse and bricks fell; builtCells/median up, within noise. Reverted.

## Cycle 27 (A/B) — day 357.3 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (tidal clay 0.05 -> 0.15)

**Hypothesis** (priority #1; plateau.js: tuning still productive): cycle 26's tidal clay lifted brickCells, so triple the deposit chance (`world.js`). Baseline batch passed (gap 2313).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 5 |
| brickCells | 114 | 157 |
| builtCells | 657 | 630 |
| benchmark gap | 2313 | 2120 |
| medianFitness | 1265 | 1225 |

Guardrails passed. Bricks +38% and cluster +1; gap -8% and builtCells slightly down; single 8k sample, within noise.

## Cycle 26 (A/B) — day 354.5 + 8k ticks (batch ran 12.5k: 25k timed out) — `kept` (STRUCTURAL: tidal clay)

**Hypothesis** (priority #1; plateau.js demanded a structural cycle; brickCells stuck at 65): clay is deposited once at world creation and never replenished, so kilns run out of raw material. Shoreline sand now re-deposits clay (4 tries/tick x 0.05, `world.js`). Baseline batch passed (gap 2230).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 82 |
| builtCells | 613 | 649 |
| benchmark gap | 2230 | 2313 |
| medianFitness | 963 | 878 |

Guardrails passed. First movement in brickCells in five brick cycles (+26%); cluster unchanged; single 8k sample, so partly noise. Watch brickCells over the next batches.

## Cycle 25 (A/B) — day 341.7 + 8k ticks — `kept` (STRUCTURAL: kiln spark lights bare ground)

**Hypothesis** (priority #1; brickCells stuck at 65): cycle 24's kiln-seeded spark picked a cell beside clay, but `ignite()` rejects cells without a flammable top, so the spark almost never fired. A kiln spark now lights bare ground beside clay (`world.js`, `ignite(idx, kiln)`). Baseline batch to day 341.7 passed (gap 2230).

| | control | treatment |
|---|---|---|
| largestCluster | 4 | 4 |
| brickCells | 65 | 65 |
| builtCells | 419 | 419 |
| benchmark gap | 2230 | 2230 |
| medianFitness | 954 | 954 |

Treatment identical to control: the new path never changed the outcome in 8k ticks (sparks are rare, 0.004 x warmth per tick, and clay rarely sits beside a spark candidate). Null result; kept per rule (equal). Next: raise clay supply or place fires deliberately rather than waiting on lightning.

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

## Cycle 89 — day 922 — `kept`

STRUCTURAL: lean winters (priority 3, plateau.js demanded structural): `world.js` base flora regrowth tries halved (16 -> 8) in Winter.
- Control vs treatment (8k ticks): medianFitness 951 -> 1109, bench gap 2258 -> 2196 (-2.7%), largestCluster 286 -> 286, brickCells 3340 -> 3338, commSeparation 0.0024 -> 0.0034, pop 499 -> 499. Guardrails pass; differences are within single-sample noise.
- Note: the 25000-tick baseline batch exceeds the 600s tool timeout now; ran 12500 ticks instead.

## Cycle 90 — day 935 — `kept`

STRUCTURAL: summer drought (priority 3, plateau.js demanded structural): `world.js` flora regrowth acceptance 0.42 -> 0.30 in Summer.
- Control vs treatment (8k ticks): all metrics identical (gap 2196, medianFitness 1113, largestCluster 298, brickCells 3343, pop 500). The 8k window (days 930-935) is not in Summer, so the change never fired; effect unverified, no harm shown. Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 91 — day 943 — `kept`

STRUCTURAL: bridge-cross reward (priority 1, plateau.js demanded structural): `nodling.js` BRIDGE_CROSS_BONUS 0.2 when stepping from land onto a bridge tile.
- Control vs treatment (8k ticks): largestCluster 282 -> 282, brickCells 3348 -> 3348, builtCells 3984 -> 3984, bench gap 2196 -> 2106 (-4%, within noise), medianFitness 1005 -> 1005, pop 500 -> 500. Guardrails pass; no measurable effect on target (bridges likely rare), no harm shown.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 92 — day 945 — `reverted`

STRUCTURAL: autumn harvest (priority 3, plateau.js demanded structural): `world.js` flora regrowth acceptance 0.42 -> 0.55 in Autumn.
- Control vs treatment (8k ticks): medianFitness 1252 -> 1183 (-5.5%), bench gap 2106 -> 2106, largestCluster 278 -> 276, brickCells 3358 -> 3354, commSeparation 0.0333 -> 0.0172, pop 501 -> 501. Guardrails pass but the growth target was not better, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 93 — day 953 — `kept`

STRUCTURAL: hearth warmth (priority 3, plateau.js demanded structural): `nodling.js` HEARTH_BONUS 0.05 per tick for warming up (body below comfort) beside, not in, a fire.
- Control vs treatment (8k ticks): all metrics identical (gap 2106, medianFitness 818, largestCluster 305, brickCells 3366, commSeparation 0.0351, pop 499). The window never triggered the bonus, so effect unverified; no harm shown. Baseline batch ran 12500 ticks.

## Cycle 94 — day 966 — `kept`

STRUCTURAL: hunger-eating reward (priority 3, plateau.js demanded structural): `nodling.js` HUNGRY_EAT_BONUS 0.3 for eating found food while energy < 60 (starvation is the main death cause).
- Control vs treatment (8k ticks): bench gap 2106 -> 2122 (+0.8%), medianFitness 1291 -> 1246 (-3.5%), largestCluster 316 -> 306, brickCells 3379 -> 3380, commSeparation 0.057 -> 0.0376, pop 500 -> 501. Guardrails pass; all differences within single-sample noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 95 — day 974 — `kept`

Breeding-eligibility age 140 -> 110 in `nodling.js` (priority 3, plateau.js said tuning still productive).
- Control vs treatment (8k ticks): bench gap 2122 -> 2240 (+5.6%), medianFitness 1075 -> 1081, brickCells 3386 -> 3388, commSeparation 0.0309 -> 0.0082, largestCluster 614 -> 283 (control was a spike; the pre-change batch measured 301), pop 499 -> 499. Guardrails pass; differences are within single-sample noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 96 — day 982 — `reverted`

Breeding-eligibility age 110 -> 90 in `nodling.js` (priority 3, plateau.js: tuning still productive).
- Control vs treatment (8k ticks): bench gap 2240 -> 2155 (-3.8%), medianFitness 1130 -> 1136, largestCluster 227 -> 231, brickCells 3396 -> 3391, commSeparation 0.0178 -> 0.0111, pop 501 -> 500. Guardrails pass, but the main growth signal (gap) was worse, so reverted; breeding age looks exhausted around 110.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 97 — day 985 — `reverted`

Hungry-eat bonus window energy < 60 -> < 90 in `nodling.js` (priority 3, plateau.js: tuning still productive).
- Control vs treatment (8k ticks): bench gap 2240 -> 2162 (-3.5%), medianFitness 976 -> 954, largestCluster 232 -> 230, brickCells 3398 -> 3397, commSeparation 0.0084 -> 0.0206, pop 499 -> 500. Guardrails pass, but the main growth signal (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 98 — day 992 — `kept`

STRUCTURAL: kiln-in-village reward (priority 1, plateau.js demanded structural): `nodling.js` KILN_SITE_BONUS 0.3 for dropping clay beside a fire within 3 cells of an existing durable structure.
- Control vs treatment (8k ticks): all metrics identical (gap 2240, medianFitness 1149, largestCluster 242, brickCells 3396, commSeparation 0.0082, pop 502). Clay-by-fire drops near structures did not occur in the window, so effect unverified; no harm shown. Baseline batch ran 12500 ticks.

## Cycle 99 — day 1000 — `reverted`

STRUCTURAL: exploration reward (priority 3, plateau.js demanded structural): `nodling.js` EXPLORE_BONUS 0.05 for entering a new 8x8 region while energy < 100.
- Control vs treatment (8k ticks): bench gap 2240 -> 2148 (-4.1%), medianFitness 1167 -> 1056, largestCluster 192 -> 232, brickCells 3418 -> 3420, commSeparation 0.0076 -> 0.0279, pop 502 -> 502. Guardrails pass, but the growth target was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 100 — day 1008 — `reverted`

STRUCTURAL: well reward (priority 1, plateau.js demanded structural): `nodling.js` WELL_BONUS 0.3 for drinking within 2 cells of a durable structure (settle by water).
- Control vs treatment (8k ticks): largestCluster 303 -> 192, bench gap 2240 -> 2059 (-8.1%), medianFitness 977 -> 945, brickCells 3421 -> 3423, commSeparation 0.0173 -> 0.0654, pop 501 -> 500. Guardrails pass, but target and growth signal were worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 101 — day 1016 — `reverted`

STRUCTURAL: provide bonus (priority 3, plateau.js demanded structural): `nodling.js` PROVIDE_BONUS 0.2 for adults eating found food with a juvenile (age < 110) within 3 cells.
- Control vs treatment (8k ticks): bench gap 2240 -> 2141 (-4.4%), medianFitness 960 -> 1097, largestCluster 327 -> 379, brickCells 3422 -> 3425, commSeparation 0.0344 -> 0.0163, pop 501 -> 500. Guardrails pass, but the gap (main growth signal) was worse, so reverted; cluster/median gains are within single-sample noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 102 — day 1029 — `kept`

STRUCTURAL: fittest-mate choice (priority 3, plateau.js demanded structural): `nodling.js` breeders now pick the fittest willing neighbour (age + 250 x offspring) as crossover mate instead of the first found.
- Control vs treatment (8k ticks): bench gap 2240 -> 2248 (+0.4%), medianFitness 1056 -> 1074, largestCluster 395 -> 259 (control was a spike), brickCells 3423 -> 3423, commSeparation 0.0251 -> 0.0345, pop 500 -> 501. Guardrails pass; differences are within single-sample noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 103 — day 1031 — `reverted`

STRUCTURAL: parental endowment (priority 3, plateau.js demanded structural): `nodling.js` ENDOW_ENERGY 25, a parent with energy >150 transfers 25 energy to its newborn.
- Control vs treatment (8k ticks): bench gap 2248 -> 2044 (-9.1%), medianFitness 1199 -> 1143, largestCluster 391 -> 303, brickCells 3423 -> 3440, commSeparation 0.021 -> 0.0161, pop 500 -> 500. Guardrails pass, but the growth target was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 104 — day 1039 — `reverted`

STRUCTURAL: spring-breed bonus (priority 3, plateau.js demanded structural): `nodling.js` SPRING_BREED_BONUS 0.3 (and +30 newborn hydration, which was a no-op as newborns start at 100) for breeding within 3 cells of water.
- Control vs treatment (8k ticks): bench gap 2248 -> 2200 (-2.1%), medianFitness 1189 -> 1130, largestCluster 320 -> 400, brickCells 3442 -> 3436, commSeparation 0.0237 -> 0.096, pop 499 -> 500. Guardrails pass, but the growth target was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 105 — day 1052 — `reverted`

STRUCTURAL: apprentice meal bonus (priority 3, plateau.js demanded structural): `nodling.js` APPRENTICE_BONUS 0.3 for a juvenile eating found food within 3 cells of an adult.
- Control vs treatment (8k ticks): bench gap 2248 -> 2161 (-3.9%), medianFitness 1041 -> 1163, largestCluster 235 -> 327, brickCells 3446 -> 3446, commSeparation 0.0336 -> 0.0223, pop 501 -> 500. Guardrails pass, but the growth target (gap) was worse, so reverted; median/cluster gains are within single-sample noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 106 — day 1055 — `reverted`

STRUCTURAL: shelter bonus (priority 1, plateau.js demanded structural): `nodling.js` SHELTER_BONUS 0.03 per tick for standing in a cell with >=2 durable neighbours while body temp is outside the comfort band.
- Control vs treatment (8k ticks): bench gap 2248 -> 1994 (-11.3%), medianFitness 1100 -> 1099, largestCluster 302 -> 298, brickCells 3446 -> 3453, commSeparation 0.0082 -> 0.001, pop 504 -> 500. Guardrails pass, but the growth target (gap) was worse and cluster did not improve, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 107 — day 1062 — `reverted`

STRUCTURAL: wide mate radius (priority 3, plateau.js demanded structural): `nodling.js` fittest-mate search radius 2 -> 4 cells.
- Control vs treatment (8k ticks): bench gap 2248 -> 2241 (-0.3%, noise), medianFitness 1309 -> 1099, largestCluster 256 -> 288, brickCells 3446 -> 3448, commSeparation 0.011 -> 0.0139, pop 502 -> 502. Guardrails pass, but the growth target was not better, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 108 — day 1070 — `reverted`

STRUCTURAL: thirst top-up bonus (priority 3, plateau.js demanded structural): `nodling.js` THIRST_TOPUP_BONUS 0.1 for drinking at hydration 40-70 (thirst is the second death cause).
- Control vs treatment (8k ticks): bench gap 2248 -> 2190 (-2.6%), medianFitness 1111 -> 1114, largestCluster 289 -> 200, brickCells 3454 -> 3448, commSeparation 0.044 -> 0.0275, pop 501 -> 500. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout). A first batch run on a stale local master (day 992) was discarded unpushed; the cycle was redone from origin/master.

## Cycle 109 — day 1078 — `reverted`

STRUCTURAL: double mutation for unproven asexual breeders (priority 3, plateau.js demanded structural): `nodling.js` children with no mate from a parent on its first offspring get a second `mutateGenome` round.
- Control vs treatment (8k ticks): bench gap 2248 -> 2012 (-10.5%), medianFitness 1001 -> 1016, largestCluster 284 -> 240, brickCells 3465 -> 3462, commSeparation 0.0032 -> 0.0421, pop 500 -> 501. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 110 — day 1086 — `reverted`

STRUCTURAL: forage-site fidelity (priority 3, plateau.js demanded structural): `nodling.js` FORAGE_SITE_BONUS 0.2 for eating found food within 6 cells of the previous meal.
- Control vs treatment (8k ticks): bench gap 2248 -> 2010 (-10.6%), medianFitness 956 -> 947, largestCluster 295 -> 243, brickCells 3472 -> 3468, commSeparation 0.0127 -> 0.0108, pop 501 -> 502. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 111 — day 1094 — `reverted`

Tuning (plateau.js: gap and brickCells flat, tuning allowed; priority 3): `nodling.js` breeding energy gate 115 -> 100.
- Control vs treatment (8k ticks): bench gap 2248 -> 1957 (-12.9%), medianFitness 1299 -> 938 (-27.8%, tripped guardrail), largestCluster -> 380, brickCells -> 3479, commSeparation -> 0.0214, pop -> 503. Reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 112 — day 1101 — `reverted`

STRUCTURAL: wean bonus (priority 3, plateau.js demanded structural): `nodling.js` WEAN_BONUS 0.5 to a living parent when its child reaches MATURITY (rewards raising offspring).
- Control vs treatment (8k ticks): bench gap 2248 -> 2162 (-3.8%), medianFitness 1147 -> 1124, largestCluster 653 -> 350, brickCells 3486 -> 3487, commSeparation 0.0287 -> 0.0217, pop 502 -> 503. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 113 — day 1110 — `reverted`

STRUCTURAL: huddle bonus (priority 3, plateau.js demanded structural): `nodling.js` HUDDLE_BONUS 0.03/tick for being cold (body < comfort) with another Nodling within 1.5 cells.
- Control vs treatment (8k ticks): bench gap 2248 -> 2048 (-8.9%), medianFitness 1041 -> 1144, largestCluster 396 -> 295, brickCells 3485 -> 3480, commSeparation 0.0406 -> 0.0287, pop 499 -> 501. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 114 — day 1117 — `reverted`

STRUCTURAL: winter frost (priority 3, plateau.js demanded structural): `world.js` flora regrowth acceptance 0.42 -> 0.30 in Winter (on top of the lean-winter halving).
- Control vs treatment (8k ticks): bench gap 2248 -> 1952 (-13.2%), medianFitness 865 -> 839, largestCluster 403 -> 297, brickCells 3494 -> 3491, commSeparation 0.0135 -> 0.0529, pop 502 -> 500. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 115 — day 1125 — `reverted`

STRUCTURAL: hungry hunt bonus (priority 3, plateau.js demanded structural): `nodling.js` HUNT_HUNGRY_BONUS 0.4 extra for a kill while energy < 60.
- Control vs treatment (8k ticks): bench gap 2248 -> 2233 (-0.7%), medianFitness 1147 -> 1147, largestCluster 408 -> 408, brickCells 3506 -> 3506, commSeparation 0.0061 -> 0.0061, pop 502 -> 502. Effect is essentially nil (hunting is rare), and the target gap was marginally worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 116 — day 1133 — `reverted`

STRUCTURAL: elder bonus (priority 3, plateau.js demanded structural): `nodling.js` ELDER_BONUS 0.5 at every 250th tick of age survived.
- Control vs treatment (8k ticks): bench gap 2248 -> 2225 (-1.0%), medianFitness 1047 -> 1080, largestCluster 323 -> 245, brickCells 3518 -> 3515, commSeparation 0.0152 -> 0.0026, pop 500 -> 500. Guardrails pass, but the growth target (gap) was marginally worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 117 — day 1141 — `reverted`

STRUCTURAL: roving meal bonus (priority 3, plateau.js demanded structural): `nodling.js` ROVING_MEAL_BONUS 0.2 for eating found food >=10 cells from the previous meal.
- Control vs treatment (8k ticks): bench gap 2248 -> 2110 (-6.1%), medianFitness 1072 (control not recorded here), largestCluster 286, brickCells 3527, commSeparation 0.0557 (control 0.1407), pop 501. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 118 — day 1148 — `kept`

STRUCTURAL: home-at-night bonus (priority 1, plateau.js demanded structural): `nodling.js` HOME_BONUS 0.02/tick for being within 4 cells of own last build site at night.
- Control vs treatment (8k ticks): bench gap 2248 -> 2311 (+2.8%), medianFitness 1052 -> 1004, largestCluster 195 -> 229, builtCells 4095 -> 4315, brickCells 3531 -> 3530, commSeparation 0.0367 -> 0.0171, pop 499 -> 500. Guardrails pass; target equal or better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 119 — day 1156 — `reverted`

STRUCTURAL: build-streak bonus (priority 1, plateau.js demanded structural): `nodling.js` STREAK_BONUS 0.2 for an adjacent build within 60 ticks of the previous adjacent build.
- Control vs treatment (8k ticks): bench gap 2311 -> 2294 (-0.7%), medianFitness 1020 -> 1020, largestCluster 320 -> 320, brickCells 3536 -> 3536, builtCells 4171 -> 4171, commSeparation 0.0098 -> 0.0098, pop 500 -> 500. Guardrails pass, but the effect is nil on the target and the gap was marginally worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 120 — day 1164 — `reverted`

STRUCTURAL: night-rest bonus (priority 3, plateau.js demanded structural): `nodling.js` REST_BONUS 0.02/tick for resting (movement < 0.1) at night.
- Control vs treatment (8k ticks): bench gap 2311 -> 2141 (-7.4%), medianFitness 1086 -> 1111, largestCluster 322 -> 327, brickCells 3535 -> 3538, builtCells 4086 -> 4057, commSeparation 0.0654 -> 0.0241, pop 503 -> 503. Guardrails pass, but the growth target (gap) was worse, so reverted.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 121 — day 1172 — `kept`

STRUCTURAL: autumn fattening bonus (priority 3, plateau.js demanded structural): `nodling.js` FATTEN_BONUS 0.01/tick for energy > 180 in Autumn.
- Control vs treatment (8k ticks): bench gap 2311 -> 2311 (flat), medianFitness 960 -> 1193, largestCluster 316 -> 403, builtCells 3929 -> 4139, brickCells 3548 -> 3543, commSeparation 0.0717 -> 0.0507, pop 499 -> 500. Guardrails pass; target equal or better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks (25000 exceeds the tool timeout).

## Cycle 122 — day 1181 — `reverted`

STRUCTURAL: cooperative-build bonus (priority 1, plateau.js demanded structural): `nodling.js` COOP_BONUS 0.2 for an adjacent build with another Nodling within 3 cells.
- Control vs treatment (8k ticks): bench gap 2311 -> 2240 (-3.1%), medianFitness 1016 -> 1020, largestCluster 404 -> 401, brickCells 3544 -> 3546, builtCells 4195 -> 4069, commSeparation 0.1682 -> 0.0752, pop 499 -> 500. Guardrails pass, but target flat/slightly worse and gap lower, so reverted.
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 123 — day 1185 — `kept`

STRUCTURAL: quarry bonus (priority 1, plateau.js demanded structural): `nodling.js` QUARRY_BONUS 0.2 for grabbing wood/plank/stone from a cell with no durable neighbours (harvest raw material instead of dismantling villages).
- Control vs treatment (8k ticks): bench gap 2311 -> 2265 (-2.0%), medianFitness 1101 -> 1110, largestCluster 401 -> 405, builtCells 4243 -> 4195, brickCells 3545 -> 3547, commSeparation 0.1274 -> 0.0966, pop 500 -> 500. Guardrails pass; target equal or better, but single 8k sample, within noise.
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 124 — day 1192 — `kept`

STRUCTURAL: cooling bonus (priority 3, plateau.js demanded structural): `nodling.js` COOL_BONUS 0.05/tick for body temp above comfort-high and falling.
- Control vs treatment (8k ticks): bench gap 2265 -> 2265, medianFitness 981 -> 981, largestCluster 387 -> 387, brickCells 3552 -> 3552, commSeparation 0.0697 -> 0.0697, pop 501 -> 501. Guardrails pass; metrics identical, so the bonus essentially never fires (null result, not a measured improvement).
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 125 — day 1197 — `kept`

STRUCTURAL: corner bonus (priority 1, plateau.js demanded structural): `nodling.js` CORNER_BONUS 0.2 for an adjacent build that also touches a durable diagonal neighbour (filled blocks, not lines).
- Control vs treatment (8k ticks): bench gap 2265 -> 2232 (-1.5%), medianFitness 1066 -> 1142, largestCluster 291 -> 379, builtCells 4024 -> 4013, brickCells 3565 -> 3556, commSeparation 0.0309 -> 0.0716, pop 502 -> 500. Guardrails pass; target better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks.

## Cycle 126 — day 1196 — `kept`

STRUCTURAL: tower bonus (priority 1, plateau.js demanded structural): `nodling.js` TOWER_BONUS 0.2 for an adjacent build dropped onto a cell already holding durable material (height, not just footprint).
- Control vs treatment (8k ticks): bench gap 2232 -> 2231, medianFitness 966 -> 966, largestCluster 384 -> 384, brickCells 3552 -> 3552, builtCells 4052 -> 4052, commSeparation 0.0851 -> 0.0851, pop 503 -> 503. Guardrails pass; metrics identical, so the bonus essentially never fires (null result, not a measured improvement).
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 127 — day 1203 — `reverted`

STRUCTURAL: call-food bonus (priority 2, plateau.js demanded structural): `nodling.js` CALL_FOOD_BONUS 0.3 for eating found food within 20 ticks of hearing a call.
- Control vs treatment (8k ticks): commSeparation 0.0431 -> 0.0205, bench gap 2231 -> 2107 (-5.6%), medianFitness 1097 -> 1114, largestCluster 296 -> 297, brickCells 3557 -> 3553, builtCells 4182 -> 4017, pop 500 -> 501. Guardrails pass, but target comm signal worse and gap lower, so reverted.
- Baseline batch ran 12500 ticks.

## Cycle 128 — day 1212 — `kept`

STRUCTURAL: well bonus (priority 1, plateau.js demanded structural): `nodling.js` WELL_BONUS 0.2 for drinking within 4 cells of a durable structure (villages pulled toward water).
- Control vs treatment (8k ticks): largestCluster 281 -> 299, brickCells 3556 -> 3563, builtCells 3946 -> 4106, bench gap 2231 -> 2057 (-7.8%), medianFitness 797 -> 1119, commSeparation 0.0438 -> 0.0141, pop 500 -> 502. Guardrails pass; target slightly better, but single 8k sample, within noise (comm and gap lower).
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 129 — day 1215 — `kept`

STRUCTURAL: notch bonus (priority 1, plateau.js demanded structural): `nodling.js` NOTCH_BONUS 0.2 for an adjacent build onto a cell with >=3 durable orthogonal neighbours (fills notches into solid blocks).
- Control vs treatment (8k ticks): bench gap 2057 -> 2057, medianFitness 992 -> 992, largestCluster 306 -> 306, brickCells 3568 -> 3568, commSeparation 0.1066 -> 0.1066, pop 500 -> 500. Guardrails pass; metrics identical, so the bonus essentially never fires (null result, not a measured improvement).
- Baseline batch ran 12500 ticks.

## Cycle 130 — day 1223 — `reverted`

STRUCTURAL: shelter bonus (priority 1, plateau.js demanded structural): `nodling.js` SHELTER_BONUS 0.03/tick for standing at night in a cell with >=2 durable orthogonal neighbours (sleep inside walls).
- Control vs treatment (8k ticks): largestCluster 302 -> 279, builtCells 4147 -> 4005, brickCells 3578 -> 3577, bench gap 2057 -> 2102, medianFitness 1140 -> 1263, commSeparation 0.1821 -> 0.0977, pop 497 -> 500. Guardrails pass, but target construction metric worse, so reverted.
- Baseline batch ran 12500 ticks.

## Cycle 131 — day 1232 — `kept`

STRUCTURAL: shore bonus (priority 1, plateau.js demanded structural): `nodling.js` SHORE_BONUS 0.2 for an adjacent build on a cell beside water (waterfront villages).
- Control vs treatment (8k ticks): bench gap 2057 -> 2057, medianFitness 883 -> 883, largestCluster 321 -> 321, brickCells 3575 -> 3575, builtCells 4019 -> 4019, commSeparation 0.288 -> 0.288, pop 501 -> 501. Guardrails pass; metrics identical, so the bonus essentially never fires (null result, not a measured improvement).
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 132 — day 1234 — `kept`

STRUCTURAL: winter build bonus (priority 1, plateau.js demanded structural): `nodling.js` WINTER_BUILD_BONUS 0.2 for an adjacent build during Winter (build through the lean season).
- Control vs treatment (8k ticks): largestCluster 309 -> 309, builtCells 4199 -> 4199, brickCells 3587 -> 3587, medianFitness 961 -> 961, commSeparation 0.0261 -> 0.0261, pop 500 -> 500, bench gap 2057 -> 1993 (-3%, benchmark cohort only). Guardrails pass; world metrics identical, so the bonus essentially never fires in the main world (null result, not a measured improvement).
- Baseline batch ran 12500 ticks.

## Cycle 133 — day 1243 — `kept`

STRUCTURAL: feast bonus (priority 1, plateau.js demanded structural): `nodling.js` FEAST_BONUS 0.2 added to the shared-meal reward when the meal is a cached one (>=2 durable walls): communal granaries.
- Control vs treatment (8k ticks): largestCluster 297 -> 299, brickCells 3586 -> 3588, builtCells 4182 -> 4127, bench gap 1993 -> 1963 (-1.5%), medianFitness 1074 -> 943, commSeparation 0.0518 -> 0.0691, pop 499 -> 500. Guardrails pass; target marginally better, but single 8k sample, within noise.
- Baseline batch ran 6250 ticks (12500 timed out at 600s).

## Cycle 134 — day 1251 — `kept`

STRUCTURAL: gap bonus (priority 1, plateau.js demanded structural): `nodling.js` GAP_BONUS 0.2 for an adjacent build that closes a gap between two opposite durable neighbours (joins wall segments).
- Control vs treatment (8k ticks): largestCluster 389 -> 389, builtCells 4367 -> 4367, brickCells 3583 -> 3583, bench gap 1963 -> 1963, medianFitness 1033 -> 1033, commSeparation 0.2573 -> 0.2573, pop 494 -> 494. Guardrails pass; metrics identical, so the bonus essentially never fires (null result, not a measured improvement).
- Baseline batch ran 12500 ticks.

## Cycle 135 — day 1254 — `kept`

STRUCTURAL: haul bonus (priority 1, plateau.js demanded structural): `nodling.js` HAUL_BONUS 0.2 for an adjacent build >=8 cells from where the material was picked up (carry material to the village instead of restacking in place). Unlike the recent null bonuses this one fires.
- Control vs treatment (8k ticks): largestCluster 276 -> 299, builtCells 3979 -> 4095, brickCells 3597 -> 3596, bench gap 1963 -> 1963, medianFitness 1144 -> 1019, commSeparation 0.0805 -> 0.1884, pop 500 -> 506. Guardrails pass; target slightly better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks.

## Cycle 136 — day 1262 — `kept`

STRUCTURAL: team build bonus (priority 1, plateau.js demanded structural): `nodling.js` TEAM_BUILD_BONUS 0.2 for an adjacent build with another Nodling within 3 cells (barn-raising: build together).
- Control vs treatment (8k ticks): largestCluster 250 -> 331, builtCells 4006 -> 4087, brickCells 3601 -> 3596, bench gap 1963 -> 1963, medianFitness 1190 -> 1123, commSeparation 0.032 -> 0.2204, pop 500 -> 500. Guardrails pass; target better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks.

## Cycle 137 — day 1270 — `reverted`

STRUCTURAL: wall-run bonus (priority 1, plateau.js demanded structural): `nodling.js` WALL_RUN_BONUS 0.2 for an adjacent build extending a straight run of >=2 durable cells.
- Control vs treatment (8k ticks): largestCluster 326 -> 314, builtCells 4132 -> 4111, brickCells 3602 -> 3603, bench gap 1963 -> 1963, medianFitness 1086 -> 1182, commSeparation 0.2518 -> 0.2733, pop 500 -> 499. Guardrails pass; target worse (within noise), so reverted.
- Baseline batch ran 12500 ticks.

## Cycle 138 — day 1277 — `reverted`

STRUCTURAL: mason bonus (priority 1, plateau.js demanded structural): `nodling.js` MASON_BONUS 0.2 for laying a fired brick beside another brick.
- Control vs treatment (8k ticks): largestCluster 330 -> 330, builtCells 4446 -> 4446, brickCells 3600 -> 3600, bench gap 1963 -> 1963, medianFitness 965 -> 965, commSeparation 0.2594 -> 0.2594, pop 501 -> 501. Guardrails pass; metrics identical, so the bonus never fires. Code discarded (null result).
- Baseline batch ran 12500 ticks.

## Cycle 139 — day 1285 — `kept`

STRUCTURAL: mixed-masonry bonus (priority 1, plateau.js demanded structural): `nodling.js` MIXED_BONUS 0.2 for an adjacent build whose material differs from a neighbouring structure's top material (wood+stone+brick).
- Control vs treatment (8k ticks): largestCluster 288 -> 306, builtCells 4060 -> 4050, brickCells 3609 -> 3609, bench gap 1963 -> 1963, medianFitness 1239 -> 1084, commSeparation 0.2345 -> 0.273, pop 502 -> 500. Guardrails pass; target slightly better, but single 8k sample, within noise.
- Baseline batch ran 12500 ticks.
