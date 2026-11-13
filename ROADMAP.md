# Nodlings roadmap

**Goal: Nodlings whose intelligence visibly grows.** Brains that learn during a lifetime, remember,
plan and eventually cooperate, because the world makes those things pay off in offspring. Villages,
bricks and calls only matter when they are the product of that intelligence.

This file is the plan the autonomous loop follows (`loop/ROUTINE_PROMPT.md` points here). It replaces
the October 2026 audit plan, whose phases 0 to 3 (continuous world, benchmark, paired A/B, dashboard)
were delivered and whose phase 4 (open-ended pressure) never started.

## Where we really are (13 November 2026, day 2054, generation 4320)

Everything below was measured on the live world, not assumed.

| Finding | Evidence |
|---|---|
| **Selection is almost switched off.** | The population sits on the hard cap of 500 for 81% of all ticks. At any moment 45% of the Nodlings are fed enough to breed, but a birth only happens when a slot frees up, so who breeds is a lottery. Only 1.3% die before adulthood. The median age at death is about 2000 ticks, long after ageing starts at 900. |
| **A third of the species never drinks.** | 35% of deaths are thirst at age 2223, which is exactly how long a newborn's water lasts (100 / 0.045 per tick). After 4300 generations these Nodlings never drank once, and it cost them nothing, because by then they had already had their lottery tickets. |
| **Learning during a lifetime does not help.** | Switching plasticity off raises the exam score by 5 to 13% (learning gain between -170 and -430 on 12 test worlds). The rule has no baseline and the reward is almost always positive (curiosity plus 45 bonuses), so it mostly pushes weights toward the clamp. Evolution has learned to work around learning. |
| **Memory is real.** | Blanking the memory senses costs 30 to 40% of the exam score (memory gain about +1000 to +1400). This is the one cognitive faculty that demonstrably pays today. |
| **The loop could not see any of this.** | Two runs of *identical* code from the same snapshot differ by 5 to 55% per metric after 6000 ticks, and every keep/revert decision was one run against one run. Of 229 changelog entries, 127 say "within noise", "null result" or "identical"; 102 changes were kept anyway. The old benchmark has been flat since day 357. |
| **Harder worlds were rejected by design.** | "Variable years" and "migrating fallow" (the scarcity ideas) were reverted because fitness dropped in the harder world. That rule rejects every increase in difficulty, which is exactly what evolution needs. |
| **Behaviour is scripted through rewards.** | `nodling.js` holds 45 hand-written reward bonuses (corner, notch, tower, shore, winter-build, haul...). The 2700-cell "village" is the product of reward shaping plus clay that seeps out of brick walls, not of cognition. |

In one sentence: **the world is solved and nothing selects for being smarter, so brains drift.** That is
why brain size fell from 205 to 77 connections without a traceable cause, and why a month of cycles moved nothing.

## Principles

1. **Pressure before machinery.** A better brain only spreads if it means more offspring. Fix selection first.
2. **The exam is fixed; the world is not.** The live world is made harder through `ENV` (in `brain.js`).
   The skill probes pin their own `EXAM` settings, so the exam stays comparable across eras. A harder world is
   judged by the exam score of the Nodlings that evolved in it, never by fitness inside the changed world.
3. **No verdict without replicates.** A change is "better" only when the paired difference over several
   replicates clears a one-sided 5% t-test (`loop/ab.js`). Otherwise it is "no effect", and no-effect changes
   are not kept. Simplicity is the default.
4. **Affordances, not bonuses.** No new reward bonuses. The existing ones are removed over time (phase 4).
5. **One number per faculty.** Skill, learning gain, memory gain today; communication gain and cooperation gain
   later. Each is an ablation: the exam score with the faculty minus the score without it.

## The instruments (phase 0, delivered with this roadmap)

- **Skill probes** (`metrics.js`, `probeCohort`): 100 living genomes are copied into fresh fixed-seed worlds
  with births off. Tasks: `base`, `scarce` (little food), `thirst` (water lasts 440 ticks). Ablations:
  `noLearning`, `noMemory`. Headline `probes.skill` = evolved minus random brains.
- **`ENV` world parameters** (`brain.js`): `thirst`, `flora`, `plasticity`. Change the live world here.
- **Instant test** (`node loop/ab.js --instant`): the same gene pool sits the exam under old and new code,
  4 replicates. About 4 minutes. Shows the immediate effect of a brain or behaviour change.
- **Evolution experiment** (`node loop/experiments.js submit ...`): the change is stored as a patch, GitHub
  Actions evolves 5 replicate worlds with it and 5 without for 60,000 ticks (about 40 generations) and
  publishes the verdict on the `experiment-results` branch. The loop harvests it on its next cycle and only
  then applies the patch to master. This moves the heavy compute out of the loop's 10-minute budget.

## Phases

Each phase has a gate. The loop works on the lowest phase whose gate is not met and takes its
hypotheses from that phase's queue (top first), or invents one that serves the same gate.

### Phase 1: switch selection back on

Make survival and breeding depend on what a Nodling does.

Queue:
1. `era-thirst-1.5x`: `ENV.thirst` 1 to 1.5, so a newborn's water lasts about 1480 ticks. The first attempt,
   `era-thirst-3x`, was reverted on 13 November: after 60,000 ticks the Nodlings that evolved under it scored 37%
   lower on every exam task (t = -9.3) and the population fell 11%. Killing a third of the population in one step
   replaces selection with luck about being born near water. Raise pressure in small steps (1.5, then 2, then 3),
   each as its own experiment. Target `probes.thirst`.
2. `era-food-limited`: `ENV.flora` 1 to 0.6, so food rather than the cap limits the population. Target `probes.scarce`.
3. `breed-by-surplus`: in `nodling.js` the breeding chance is a flat 0.008 per tick. Scale it with the energy
   surplus above the threshold (for example x0.5 at 115, x2 at 220), so better foragers have more offspring. Target `probes.evolved`.
4. `soft-cap`: replace the hard `w.pop < POP_CAP` gate with crowding that costs energy, so the weakest starve
   instead of the lucky breeding. Target `probes.evolved`.
5. `predators-matter`: 4 predators hunt 500 Nodlings. Scale `PRED_CAP` with the population (about 1 per 25). Target `probes.evolved`.
6. `earlier-ageing`: `SENESCENCE` 900 to 600, which shortens the post-breeding tail and speeds up generations. Target `probes.evolved`.

**Gate:** the 5-cycle average of `probes.skill` is at least 15% above the average of cycles 229 to 233 (the
first five measured with the exam), and fewer than 5% of deaths are "never drank" deaths. Always use the
5-cycle average: a single reading swings a lot (1789 at day 2054, 985 at day 2063, with no rule change in
between), because a near-neutral population with heavy mutation drifts quickly.

### Phase 2: learning that pays

Today plasticity is a tax. Fix the rule, then make the world need it.

Queue:
1. `reward-baseline`: learn from reward minus its running average (a prediction error), not from raw reward.
   In `Nodling.tick`, keep an exponential average of the reward and pass the difference to `brain.step`. Target `probes.learningGain`.
2. `no-curiosity-in-reward`: remove the novelty term from the learning signal; it is always positive. Target `probes.learningGain`. Submit with `--simplify`.
3. `eligibility-trace`: rewards arrive ticks after the action that earned them. Keep a decaying trace of
   pre x post activity per plastic synapse and apply the reward to the trace. Target `probes.learningGain`.
4. `evolvable-learning-rate`: a per-genome learning-rate gene (mutated like `diet`), so lineages can turn
   learning down or up instead of sharing one global `LEARN_RATE`. Target `probes.learningGain`.
5. `things-genes-cannot-know`: per-world facts that differ between lifetimes, for example two flora variants of
   which one is nourishing and one is not, re-drawn every year, with a sense that tells them apart. Only learning
   can solve it. Add a matching exam task `relearn` to `PROBE_TASKS` in the same change.

Status: `reward-baseline` passed its evolution experiment on 13 November (learning gain -230 to -17, t = 2.18)
and lands with the next harvest. Learning went from harmful to neutral; the remaining items must make it useful.

**Gate:** the 5-cycle average of `probes.learningGain` is positive and it is measurably above zero in an instant test.

### Phase 3: memory and planning

Queue: patchy food far from water (commuting), seasonal food that moves so last year's spot matters, food that
keeps in a cache, a longer exam horizon. Add exam tasks `commute` and `seasons`. Use more than two memory cells if the brains fill them.

**Gate:** the 5-cycle average of `probes.memoryGain` rises 25% above the average of cycles 229 to 233, and the new tasks show evolved Nodlings beating random ones.

### Phase 4: strip the scaffolding

Remove the 45 reward bonuses in groups of 5 to 8 (construction geometry first: corner, notch, gap, tower,
shore, mixed, winter-build), each as a `--simplify` experiment. A bonus that survives must be shown to matter.
Also remove `VILLAGE_SURVIVAL_PERKS` and its dead branches.

**Gate:** at most 5 bonuses left, `probes.skill` not lower than before the phase.

### Phase 5: social intelligence

Communication gain (exam score minus the score with hearing blanked) and cooperation tasks that one Nodling
cannot solve alone (prey that needs two strikes from two hunters, loads that need two carriers). Evolved
predator genomes in the exam so the arms race is measured.

**Gate:** communication gain measurably above zero.

### Phase 6: open-endedness

Several islands with rare migration (protects diversity), a curriculum that raises `ENV` automatically when
skill plateaus, a hall of champions replayable in the browser.

### Engineering track (any cycle may take one of these instead of a hypothesis when nothing is ready)

- Speed: the sim does about 50 ticks per second at 500 Nodlings. Flatten `Brain.incoming` into typed arrays,
  replace per-tick `Array.some` scans, cache the village scan. Target 2x, with bit-identical metrics (CI checks determinism).
- Layout: move the sim into `src/`, keep `index.html` at the root for Pages.
- Tests: a probe regression test in CI (fixed genomes give a fixed score).
- Showcase: a champion replay and a brain viewer in `index.html`; a weekly GIF of the world in the README.

## What not to do

- No reward bonuses, no multipliers on existing bonuses, no village perks.
- No keeping a change because "guardrails pass". No effect means revert.
- No judging a harder world by fitness inside that world.
- No more than 2 experiments running at once; no experiment that changes more than one thing.
