# Nodlings loop rules

```json
{
  "world_seed": 20261114,
  "batch_ticks": 12000,
  "probes": {"ticks": 4800, "cohort": 60, "seeds": [101, 202, 303]},
  "ab": {"instant_replicates": 4, "replicates": 5, "ticks": 60000, "probe_cohort": 100, "min_effect_pct": 2},
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40,
    "max_skill_drop_pct": 25,
    "min_reach_water": 0.9,
    "max_wall_share": 0.2
  }
}
```

## The plan
`ROADMAP.md` is the plan: the current phase (W1 to W5), its gate and its hypothesis queue. Read it every cycle.
`loop/PLAYBOOK.md` explains the reasoning, the decision rules for unclear cases, the pitfalls and what to do
when a phase stalls.
**The goal is invention without scripting**: Nodlings that find uses for things and change their own behaviour
because it helps their bodies and their offspring, shown on an unchanging exam and in the technique ledger.

## The world is continuous
`loop/world.json.gz` is the full world (terrain, items, creatures, RNG stream); every batch resumes it.
Never delete it: deleting it starts a new world from `world_seed`. The run is deterministic: the same snapshot,
code and ticks give identical metrics. This is World 2, started on 14 November 2026; the first world is in `archive/v1/`.

## Metrics (what to read)
`loop/metrics.json`, appended every cycle to `loop/history.jsonl` and charted in `loop/progress.svg`:
- `probes.skill`: the headline. A sample of the living adults sits a fixed exam (tasks `base`, `scarce`,
  `thirst`; fresh fixed-seed worlds, births off, 1.5 years) and is compared with random brains. `probes.evolved`
  is the same number before subtracting the random reference; A/B tests use it.
- `probes.learningGain`, `memoryGain`, `handsGain`, `socialGain`: the `base` score minus the score with that
  faculty switched off. At or below 0 means the faculty does not help.
- `probes.badMealShare`: share of exam meals that were the poisonous plant kind. 0.5 = cannot tell them apart.
- `techniques`, `toolTechniques`, `ledger`: what Nodlings did with things in this batch, by share of Nodlings.
- `wallShare`, `canReachWater`: world health, guardrails below.
- `avgBrain`, `medianFitness`, `medianAge`, `maxGen`, `carrying`, `commSeparation`: context only. Never base a
  decision on a single value.

## World parameters and the exam
The live world's difficulty lives in `ENV` in `brain.js` (`thirst`, `flora`, `cold`, `predators`, `plasticity`,
`flip`) and in the numbers of `materials.js`. The probes pin their own `EXAM` values while they run, so making
the live world harder does not change the exam. Do not edit `EXAM`, `PROBE_TASKS`, the score formula or the
probe seeds except to ADD a task that a roadmap phase asks for. A change to `materials.js` does change the exam
world too; that is accepted, because both arms of an A/B sit the same exam.

## How a change is judged
One run against one run proves nothing (`node loop/ab.js --aa` shows the noise floor). Two tests exist:

1. **Instant test**, `node loop/ab.js --instant --target=<metric>` (resumable: if it is cut off, run the same
   command again). The same gene pool sits the exam under HEAD and under the working tree, 4 replicates. Use it
   as a screen for brain and learning changes. A world change (`ENV`, `materials.js`, selection) is screened
   with `node loop/run-headless.js --dry --era --no-bench --ticks=6000 --compare=loop/metrics.json` instead
   (fitness inside a harder world is allowed to drop; the population must survive), followed by the step-size
   check in PLAYBOOK section 4.
2. **Evolution experiment**, `node loop/experiments.js submit <id> --target=<metric> --note="<what and why>"`.
   This stores the working-tree change as `loop/experiments/<id>/change.patch`, restores the working tree, and
   (after commit and push) GitHub Actions evolves 5 replicate worlds with the change and 5 without for 60,000
   ticks, then publishes the verdict. `node loop/experiments.js harvest` on a later cycle applies the patch if
   the verdict is `keep`. Add `--simplify` for a change that only removes something: it is kept unless measurably worse.
   Ids start with `w2-` and are never reused.

A metric is `better`/`worse` only if the paired difference over the replicates clears a one-sided 5% t-test and
is at least `min_effect_pct`. **Sim changes reach master only through a harvested `keep`.** The loop never
commits a sim change directly.

## Guardrails (hard revert, no exceptions)
- Population must not fall below `min_population`, or more than `max_population_drop_pct` below control.
- `canReachWater` must stay at or above `min_reach_water` and `wallShare` at or below `max_wall_share`.
- No NaN or non-finite metric. `selfTest()` must pass; CI (the tests in `test/` and `loop/ci-check.js`) must be green.
- `probes.evolved` must not be measurably worse by more than `max_skill_drop_pct`.

## Change policy
- Work on the lowest ROADMAP phase whose gate is not met. Take the top unsubmitted hypothesis of its queue, or
  one of your own that serves the same gate.
- Exactly ONE change per experiment, small and falsifiable. At most 2 experiments running at once.
- Banned: any reward other than the change in the body's own state (no bonuses, no curiosity, no novelty), any
  material name inside a rule, any item that never rots, survival perks of any kind, and anything already
  `reverted` in `loop/hypotheses.json` for the same reason.
- New senses, outputs, verbs, rules or kinds of world state are design changes: write a note in ROADMAP and
  wait for Stijn. New material rows and new values of existing numbers are ordinary experiments.
- Every cycle writes a CHANGELOG entry, including INCIDENT cycles and cycles that only harvest or only submit.
- If the baseline batch fails a guardrail, commit it as-is, log an `INCIDENT:` entry, push, and make no change
  that cycle. A human decides what to do about incidents.
