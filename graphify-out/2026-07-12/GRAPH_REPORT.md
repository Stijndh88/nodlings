# Graph Report - .  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 176 nodes · 273 edges · 24 communities (13 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 758 input · 212 output

## Community Hubs (Navigation)
- Game State & Progress
- Neural Brain & Genome
- World Generation & Environment
- Sprite & Creature Rendering
- Observer & Metrics Logging
- Camera & Render Pipeline
- Nodling Agent Behavior
- Graph Documentation Tools
- Predator Spawning & Updates
- World Materials & Seasons
- Critter Spawning & Updates
- Predator-Nodling Arms Race
- Herbivore Carnivore Niches
- Emergent Affordance Behavior
- Hall of Fame Persistence
- Hebbian Plasticity Reward
- K-Selection Stable Ecology
- NEAT Neural Evolution
- Data-Driven Self-Rewriting
- Nodlings Welcome Doc

## God Nodes (most connected - your core abstractions)
1. `World` - 24 edges
2. `mutateGenome()` - 11 edges
3. `Nodling` - 8 edges
4. `randomGenome()` - 7 edges
5. `runObserver()` - 7 edges
6. `addConn()` - 6 edges
7. `bindInput()` - 6 edges
8. `saveProgress()` - 5 edges
9. `seed()` - 5 edges
10. `updateStats()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify CLI Query Tools** — graphify_query, graphify_path, graphify_explain, graphify_update [EXTRACTED 0.95]
- **Nodling Neural Evolution & Plasticity Flow** — nodling_js, brain_js, concept_neat_evolution, concept_hebbian_plasticity, concept_self_rewrite [EXTRACTED 0.95]
- **Predator-Nodling Arms Race System** — nodling_js, predators_js, brain_js, concept_arms_race [EXTRACTED 0.93]
- **Stable Ecology & Population Dynamics** — world_js, nodling_js, concept_k_selection, concept_diet_niches, concept_hall_of_fame [EXTRACTED 0.88]

## Communities (24 total, 11 thin omitted)

### Community 0 - "Game State & Progress"
Cohesion: 0.10
Nodes (25): applySave(), behaviorArchive, clockStr(), critters, drawSparkline(), fameEntry(), flashSaved(), frame() (+17 more)

### Community 1 - "Neural Brain & Genome"
Cohesion: 0.13
Nodes (24): addConn(), biasId(), Brain, clampW(), crossBody(), crossoverGenome(), hasConn(), hiddenIds() (+16 more)

### Community 3 - "Sprite & Creature Rendering"
Cohesion: 0.26
Nodes (15): buildCreature(), buildCritter(), buildPredator(), buildTiles(), _creatureCache, creatureSig(), creatureSprite(), critterSprite() (+7 more)

### Community 4 - "Observer & Metrics Logging"
Cohesion: 0.27
Nodes (12): observer, observerIssue(), observerMarkdown(), observerMetrics(), observerNote(), observerOnce(), observerThrottled(), observerTick() (+4 more)

### Community 5 - "Camera & Render Pipeline"
Cohesion: 0.33
Nodes (11): bindInput(), camera, clampCam(), clearSelection(), draw(), drawMini(), hover, initRender() (+3 more)

### Community 7 - "Graph Documentation Tools"
Cohesion: 0.36
Nodes (7): graphify explain, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, graphify-out/wiki/index.md, graphify path, graphify query, graphify update

### Community 8 - "Predator Spawning & Updates"
Cohesion: 0.36
Nodes (5): Predator, predFame, predFameGenome(), spawnPredators(), updatePredators()

### Community 9 - "World Materials & Seasons"
Cohesion: 0.29
Nodes (6): makeRng(), MATERIALS, PERISHABLE, _scanBest, _scanDist, SEASONS

### Community 10 - "Critter Spawning & Updates"
Cohesion: 0.47
Nodes (3): Critter, spawnCritters(), updateCritters()

## Knowledge Gaps
- **39 isolated node(s):** `OUTPUTS`, `NODLING_SCHEMA`, `PRED_SCHEMA`, `_innovMap`, `_splitMap` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `World` connect `World Generation & Environment` to `World Materials & Seasons`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `OUTPUTS`, `NODLING_SCHEMA`, `PRED_SCHEMA` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game State & Progress` be split into smaller, more focused modules?**
  _Cohesion score 0.09885057471264368 - nodes in this community are weakly interconnected._
- **Should `Neural Brain & Genome` be split into smaller, more focused modules?**
  _Cohesion score 0.1330049261083744 - nodes in this community are weakly interconnected._