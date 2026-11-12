# Nodlings loop rules

```json
{
  "world_seed": 20261007,
  "batch_ticks": 25000,
  "validation_ticks": 8000,
  "benchmark": {"ticks": 2500, "cohort": 30, "seeds": [101, 202, 303]},
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40,
    "max_benchmark_drop_pct": 25
  },
  "tunable_params": [
    {"file": "nodling.js", "const": "REPRO_THRESHOLD", "range": [0.4, 0.9]},
    {"file": "world.js", "const": "FIRE_SPREAD_RATE", "range": [0.01, 0.2]},
    {"file": "brain.js", "const": "LEARN_RATE", "range": [0.005, 0.05]},
    {"file": "nodling.js", "const": "POP_CAP", "range": [250, 800]}
  ]
}
```

## The world is continuous
`loop/world.json.gz` is the full world (terrain, structures, creatures, RNG
stream); every batch resumes it, so structures, lineage depth and `maxGen`
accumulate across cycles. Never delete it casually: deleting it starts a new
world from `world_seed`. The run is deterministic: the same snapshot + same
code + same ticks gives identical metrics.

## Metrics (what to read)
`loop/metrics.json`, and every cycle appended to `loop/history.jsonl` (charted
in `loop/progress.svg`):
- `benchmark.gap` — a fitness-stratified sample of the CURRENT living gene pool minus random genomes, on 3 fixed
  seeds (`benchmark` block above). The main "have Nodlings learned" number. (Until cycle 223 it used the hall of
  fame, which is frozen by ancient high scores, so the old gap (~1950) is not comparable with the new one (~1360).)
- `medianFitness` / `meanFitness` — the *living* population (age + 250 x offspring).
- `largestCluster` / `builtCells` / `brickCells` — construction (priority 1).
- `commSeparation` — call-frequency gap with vs without a predator near (priority 2).
- `peakFitness` — the old hall-of-fame peak. It cannot fall and saturates near
  6000, so it is shown for reference only. Never use it as a signal.

## Guardrails (hard revert, no exceptions)
- Population must not crash below `min_population`.
- No NaN/non-finite metric.
- `selfTest()` must still pass; CI (`loop/ci-check.js`) must be green.
- Median fitness must not drop more than `max_fitness_drop_pct` vs the paired control (A/B `--dry` runs only: living-population median swings with turnover, so it is not compared across batches).
- Population must not drop more than `max_population_drop_pct` vs the paired control.
- Benchmark gap must not drop more than `max_benchmark_drop_pct` vs the paired control.

## Validating a change: paired A/B (this replaces "run once, compare to the last batch")
1. Run the baseline batch (`node loop/run-headless.js --ticks=25000 --compare=loop/metrics.json`; this guards against drift since the last batch) and commit it. That is the control snapshot.
2. Before editing code, record the control: `node loop/run-headless.js --dry --bench --ticks=8000 --out=/tmp/control.json` (writes nothing to the repo).
3. Make the ONE change, then run the treatment from the same snapshot: `node loop/run-headless.js --dry --bench --ticks=8000 --compare=/tmp/control.json`.
4. Because both runs start from the identical snapshot and RNG stream, differences are caused by the change. Keep it only if guardrails pass AND the targeted metric (e.g. `largestCluster` for priority 1) is not worse; record the delta in the CHANGELOG, including when it is a null result.
5. Update `loop/hypotheses.json` (status, cycle, note) in the same commit.

## Priority signals (push toward, in this order)
**The project goal is evolved intelligence: Nodlings that get measurably better at surviving and reproducing by
learning and brain evolution.** Villages and communication are only interesting as tools toward that.
1. **Evolved skill** — raise `benchmark.gap` and `medianFitness`, keep `avgBrain` healthy (collapse below ~100 means
   selection no longer rewards cognition). Prefer changes that make brains matter: harder or more varied
   environments, scarcity that rewards learning/memory, new senses/actions, better selection, mutation and
   crossover (NEAT speciation, elitism, innovation protection), and brain/learning machinery.
2. **Communication** — track `commSeparation`; make alarm/food calls learnable and useful for survival.
3. **Construction / villages** — `largestCluster`, `brickCells`. These are already saturated.

## Banned: selection shields
Do NOT add survival perks (nutrition, thirst, metabolism, senescence, mating, predator immunity, newborn energy) for
being in a village or building. They inflate cluster metrics while removing the selection pressure that evolves
brains (`VILLAGE_SURVIVAL_PERKS` in `nodling.js` is deliberately off). Pure reward-shaping bonuses for a *new*
behaviour are still fine, but not another x1.5/x2 multiplier on an existing bonus.

## Change policy
- Run `node loop/plateau.js` at the start of a cycle. If it says a STRUCTURAL cycle is required (3+ metrics flat or falling over the last 4 cycles), the change this cycle must be structural (new affordance, environmental pressure, sense or reward shaping), not another knob tweak. Ideas: harder winters or a scarce material once clusters saturate, a second island, nest/shelter payoffs, a food-found call affordance.
- Exactly ONE change per cycle, small and falsifiable, tied to one priority
  signal above.
- Check `loop/CHANGELOG.md` and `loop/hypotheses.json` first — don't retry a
  hypothesis already marked `reverted` (or `running` by another session) for the
  same reason. `untested` ones were closed without a result and may be retried.
- Every cycle writes a CHANGELOG entry, including INCIDENT and null-result cycles.
- Anything in `tunable_params` needs no special flag. Anything else (new
  mechanic, new sense/output, structural rewiring, new file) is still
  applied autonomously but logged with a `STRUCTURAL:` prefix in
  `CHANGELOG.md` for easy review.
- Grow `tunable_params` over time as safe knobs are identified — edit this
  file's JSON block directly when that happens (that edit is itself exempt
  from the "one change per cycle" cap, since it's meta/policy, not sim
  behavior).
- If the *baseline* batch (before any new change) fails a guardrail, that
  means an earlier cycle's "kept" change was actually bad and only showed it
  now. Don't try to auto-locate and revert that old commit — commit the
  batch output as-is, log an `INCIDENT:` entry in CHANGELOG with the
  guardrail reasons, push, and skip making a new change this cycle. A human
  reviewing CHANGELOG decides what to do about incidents.
