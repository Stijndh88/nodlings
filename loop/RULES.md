# Nodlings loop rules

```json
{
  "world_seed": 20261007,
  "batch_ticks": 15000,
  "validation_ticks": 8000,
  "probes": {"ticks": 3000, "cohort": 100, "seeds": [101, 202, 303]},
  "ab": {"instant_replicates": 4, "replicates": 5, "ticks": 60000, "probe_cohort": 200, "min_effect_pct": 2},
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40,
    "max_skill_drop_pct": 25
  },
  "tunable_params": [
    {"file": "nodling.js", "const": "REPRO_THRESHOLD", "range": [0.4, 0.9]},
    {"file": "world.js", "const": "FIRE_SPREAD_RATE", "range": [0.01, 0.2]},
    {"file": "brain.js", "const": "LEARN_RATE", "range": [0.005, 0.05]},
    {"file": "nodling.js", "const": "POP_CAP", "range": [250, 800]}
  ]
}
```

## The plan
`ROADMAP.md` is the plan: the current phase, its gate and its hypothesis queue. Read it every cycle.
**The goal is evolved intelligence**: Nodlings that get measurably better at an unchanging exam through brain
evolution and learning.

## The world is continuous
`loop/world.json.gz` is the full world (terrain, structures, creatures, RNG stream); every batch resumes it.
Never delete it: deleting it starts a new world from `world_seed`. The run is deterministic: the same snapshot,
code and ticks give identical metrics.

## Metrics (what to read)
`loop/metrics.json`, appended every cycle to `loop/history.jsonl` and charted in `loop/progress.svg`:
- `probes.skill`: the headline. A sample of the living gene pool sits a fixed exam (tasks `base`, `scarce`,
  `thirst`; fresh fixed-seed worlds, births off) and is compared with random brains. `probes.evolved` is the
  same number before subtracting the random reference; A/B tests use it.
- `probes.learningGain`: `base` score minus the score with plasticity off. At or below 0 means learning does not help.
- `probes.memoryGain`: `base` score minus the score with the memory senses blanked.
- `avgBrain`, `medianFitness`, `maxGen`, `largestCluster`, `brickCells`, `commSeparation`: context only.
  They swing 5 to 55% between identical runs, so never base a decision on a single value.
- `peakFitness` and the old `benchmark.gap` are retired.

## World parameters and the exam
The live world's difficulty lives in `ENV` in `brain.js` (`thirst`, `flora`, `plasticity`). The probes pin
their own `EXAM` values while they run, so making the live world harder does not change the exam. Do not edit
`EXAM`, `PROBE_TASKS` or the probe seeds except to ADD a task that a roadmap phase asks for.

## How a change is judged
One run against one run proves nothing (`node loop/ab.js --aa` shows the noise floor). Two tests exist:

1. **Instant test**, `node loop/ab.js --instant --target=<metric>` (about 4 minutes, resumable: if it is cut
   off, run the same command again). The same gene pool sits the exam under HEAD and under the working tree,
   4 replicates. Use it as a screen for brain, sense, action and reward changes. A world-parameter (`ENV`) change
   cannot move the exam, so screen it with `node loop/run-headless.js --dry --era --no-bench --ticks=6000 --compare=loop/metrics.json` instead
   (fitness inside a harder world is allowed to drop; the population must survive).
2. **Evolution experiment**, `node loop/experiments.js submit <id> --target=<metric> --note="<what and why>"`.
   This stores the working-tree change as `loop/experiments/<id>/change.patch`, restores the working tree, and
   (after commit and push) GitHub Actions evolves 5 replicate worlds with the change and 5 without for 60,000
   ticks, then publishes the verdict. `node loop/experiments.js harvest` on a later cycle applies the patch if
   the verdict is `keep`. Add `--simplify` for a change that only removes something: it is kept unless measurably worse.

A metric is `better`/`worse` only if the paired difference over the replicates clears a one-sided 5% t-test and
is at least `min_effect_pct`. **Sim changes reach master only through a harvested `keep`.** The loop never
commits a sim change directly.

## Guardrails (hard revert, no exceptions)
- Population must not fall below `min_population`, or more than `max_population_drop_pct` below control.
- No NaN or non-finite metric. `selfTest()` must pass; CI (`loop/ci-check.js`) must be green.
- `probes.evolved` must not be measurably worse by more than `max_skill_drop_pct`.

## Change policy
- Work on the lowest ROADMAP phase whose gate is not met. Take the top unsubmitted hypothesis of its queue, or
  one of your own that serves the same gate.
- Exactly ONE change per experiment, small and falsifiable. At most 2 experiments running at once.
- Banned: new reward bonuses, multipliers on existing bonuses, survival perks for villages or builders
  (`VILLAGE_SURVIVAL_PERKS` stays off), and anything already `reverted` in `loop/hypotheses.json` for the same reason.
- `tunable_params` may be changed inside their range, but still only through an experiment.
- Every cycle writes a CHANGELOG entry, including INCIDENT cycles and cycles that only harvest or only submit.
- If the baseline batch fails a guardrail, commit it as-is, log an `INCIDENT:` entry, push, and make no change
  that cycle. A human decides what to do about incidents.
