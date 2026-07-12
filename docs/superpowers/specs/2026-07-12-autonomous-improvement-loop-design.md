# Autonomous improvement loop — design

Date: 2026-07-12

## Motivation

`nodlings-observations-day513.md` shows 513 in-sim days of a healthy but
plateauing population: lineages keep deepening, flocking keeps forming, but
fitness repeatedly flatlines (day 235, day 413) and the README's own "known
ceiling" — genuine multi-step construction (visible villages) — hasn't been
climbed despite all the affordances for it existing (bricks, kilns, bridges,
fiber-bound structures).

The goal: a loop that runs *by itself*, on a schedule, without a chat session
open, that (1) simulates the world far faster than real time, (2) checks the
result against a fixed set of guardrails and priority signals, (3) makes one
code/tuning change per cycle aimed at one of those signals, and (4) keeps the
change only if it doesn't regress the guardrails — fully autonomous, with git
commit/revert as the safety net instead of human approval per cycle.

## Non-goals

- Not touching the user's own browser-driven instance or its manual
  `nodlings-observations-day513.md` export — those stay exactly as they are.
- Not adding a browser-automation dependency (Playwright etc.) — the core sim
  files have no DOM coupling, so a headless Node harness covers it.
- Not building a UI for this — it's a git-committed, markdown/JSON-logged,
  cron-driven process. Reviewing it means reading `loop/CHANGELOG.md` and
  `loop/observations.md`, or `git log`.

## Architecture

```
Cron routine (every 6h, fresh Claude Code agent each time)
  1. git status; read loop/RULES.md + loop/CHANGELOG.md (tail) + loop/state.json
  2. node loop/run-headless.js --ticks=<batch_ticks from RULES.md>
       resumes loop/save.json (own hall-of-fame, separate from browser localStorage)
       runs simTick() in a loop, calling runObserver() on the same DAY_LEN
       cadence main.js uses
       writes loop/save.json, appends loop/observations.md, writes
       loop/metrics.json, prints a metrics summary + guardrail verdict
  3. guardrails fail → git revert to last good commit, log incident, stop
     guardrails pass → git commit (code-as-was + save + observations + metrics)
                        = this cycle's baseline
  4. agent picks ONE hypothesis from RULES.md's priority signals, skipping
     anything CHANGELOG already marked `reverted` for the same reason
  5. agent edits the code (tunable const or structural change) + one-line
     rationale
  6. node loop/run-headless.js --ticks=<validation_ticks> --compare=loop/metrics.json
       runs a shorter batch from the post-change state, diffs against the
       baseline metrics, prints PASS/REVERT + which guardrail(s) tripped
  7. REVERT → git revert this commit; CHANGELOG entry marked `reverted`
     PASS   → git commit; CHANGELOG entry marked `kept` (`STRUCTURAL:` prefix
              if the change wasn't in RULES.md's tunable_params list)
  8. exit
```

Set up via the `schedule` skill (`CronCreate`) — the cron prompt is short and
mechanical (the 8 steps above); it delegates *what the checks and targets
are* to `loop/RULES.md` so a cold agent with no memory of this conversation
has everything it needs.

### Why a headless Node harness, not the browser

`world.js`, `nodling.js`, `brain.js`, `critters.js`, `predators.js`, and
`observer.js` have zero DOM/`window`/`canvas` references. Only two calls in
`observer.js` touch `localStorage` (save/load the observation log), and
`main.js`'s `loadProgress`/`saveProgress` do the same for the hall of fame.
`loop/run-headless.js` loads the six sim files as plain scripts (`vm`
context), stubs `localStorage` as a small file-backed object pointed at
`loop/save.json`, and drives the same `seed()` / `spawnCritters()` /
`spawnPredators()` / `simTick()` sequence `main.js` runs at startup — just
without `render.js`, `sprites.js`, or `requestAnimationFrame`. This runs
orders of magnitude faster than real time (no rendering, no frame cap), so a
6-hour cadence can simulate far more than 6 hours of sim time per cycle.

### Self-test reuse

`main.js` already has an inline `selfTest()` IIFE (brain math sanity, genome
mutation validity, plasticity). Extract it into `selftest.js` exposing
`selfTest()`, loaded by both `index.html` (browser, unchanged behavior) and
`run-headless.js` (called once at harness startup — a broken sim fails loud
and fast, before wasting a cycle on a corrupted brain).

## `loop/RULES.md`

Two parts: a fenced ` ```json ` config block (machine-read by
`run-headless.js`, no YAML dependency needed) and prose sections the agent
reads each cycle.

````markdown
# Nodlings loop rules

```json
{
  "batch_ticks": 80000,
  "validation_ticks": 16000,
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40,
    "require_self_test_pass": true,
    "require_no_nan": true
  },
  "tunable_params": [
    {"file": "nodling.js", "const": "REPRO_THRESHOLD", "range": [0.4, 0.9]},
    {"file": "world.js", "const": "FIRE_SPREAD_RATE", "range": [0.01, 0.2]},
    {"file": "brain.js", "const": "LEARN_RATE", "range": [0.005, 0.05]}
  ]
}
```

## Guardrails (hard revert, no exceptions)
- Population must not crash below `min_population`.
- No NaN/exception during the validation batch.
- `selfTest()` must still pass.
- Best fitness must not drop more than `max_fitness_drop_pct` vs baseline.
- Population must not drop more than `max_population_drop_pct` vs baseline.

## Priority signals (push toward, in this order)
1. **Multi-step construction / villages** — durable-structure clusters,
   brick/kiln chains, bridges used for territory, not just scattered
   stacking. Target: beat the current best (`built >= 25` milestone) by an
   order of magnitude, sustained, not a one-off spike.
2. **Communication** — the sound channel exists but carries no evolved
   meaning yet. Look for correlation between sound emission and nearby
   Nodling behavior (alarm→flee, food-found→approach) as a signal it's
   being used; bias reward/sensory wiring to make that correlation
   learnable if it isn't showing up.
3. **Sustained open-ended growth** — break the repeated fitness/generation
   plateaus the observation log shows (day 235, day 413 pattern). Prefer
   changes that widen the fitness landscape (new affordances, sensory
   inputs, reward shaping) over re-tuning existing knobs once this pattern
   recurs.

## Change policy
- Exactly ONE change per cycle, small and falsifiable, tied to one priority
  signal above.
- Check `loop/CHANGELOG.md` first — don't retry a hypothesis already marked
  `reverted` for the same reason.
- Anything in `tunable_params` needs no special flag. Anything else (new
  mechanic, new sense/output, structural rewiring, new file) is still
  applied autonomously but logged with a `STRUCTURAL:` prefix in
  `CHANGELOG.md` for easy review.
- Grow `tunable_params` over time as safe knobs are identified — edit this
  file's JSON block directly when that happens (that edit is itself exempt
  from the "one change per cycle" cap, since it's meta/policy not sim
  behavior).
````

## Files this introduces

| File | Role |
|---|---|
| `loop/RULES.md` | Checks, guardrails, priority signals, change policy (above) |
| `loop/run-headless.js` | Node harness: loads sim files, stubs storage, runs batches, computes metrics, checks guardrails, prints verdict |
| `selftest.js` | Extracted from `main.js`'s inline IIFE; shared by browser and headless harness |
| `loop/save.json` | Headless world's own hall-of-fame + world state (git-committed each cycle — reverting a commit reverts the population too) |
| `loop/observations.md` | Same milestone/issue/trend log format as the browser Observer, for the headless world |
| `loop/CHANGELOG.md` | One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted` |
| `loop/metrics.json` | Latest cycle's metrics snapshot (input to next cycle's `--compare`) |
| `loop/state.json` | Cycle counter + last-run timestamp |

## Setup this plan includes

- `git init` in `C:\Nodlings`, initial commit of the existing project as-is.
- Extract `selftest.js` from `main.js`.
- Write `loop/run-headless.js` with a `--selftest`-first startup, `--ticks`,
  `--resume` (default on), `--compare=<metrics.json>` flags; JSON metrics +
  guardrail verdict on stdout.
- Seed `loop/RULES.md`, empty `loop/CHANGELOG.md`, empty `loop/state.json`.
- Register the cron routine (`schedule` skill) at a 6-hour interval, prompt
  = the 8-step procedure above, pointing at `loop/RULES.md` for specifics.

## Open risks (acceptable, not blocking)

- Fully autonomous code edits *can* still drift the sim in an undesired
  direction even while passing guardrails (guardrails catch collapse, not
  "got less interesting"). Mitigated by the CHANGELOG being human-readable —
  worth a periodic skim, not a per-cycle gate.
- `loop/save.json` diffs will make commits noisy (hall-of-fame genome
  arrays). Acceptable; can be addressed later (e.g. a custom git diff
  driver) if repo size becomes a real problem — not solving it upfront.
