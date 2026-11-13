# Nodlings playbook

How to carry this project forward, written so that any model (or person) can do it well without
having been there when the plan was made. `ROADMAP.md` says **what** to work on. `loop/RULES.md` and
`loop/ROUTINE_PROMPT.md` say **what to do each cycle**. This file says **why**, **how to decide**, and
**what to do when the rules do not cover the situation**.

If this file and your own intuition disagree, follow this file. Every rule here exists because the
opposite was tried and failed; the incident is named next to the rule.

## 1. The idea in five sentences

1. Evolution only improves what selection can see: a smarter brain spreads only if it leaves more offspring.
2. In November 2026 selection was nearly off (births were a lottery for free slots), so brains drifted for a month.
3. So the order of work is fixed: first make survival and breeding depend on behaviour (phase 1), then make
   learning worth having (phase 2), then memory and planning (phase 3), and only then social skills (phase 5).
4. We can only know that something worked by measuring it on an exam that never changes, with enough
   repetitions to beat the noise.
5. Anything that cannot show its effect is not kept, because every unproven rule makes the next result harder to read.

## 2. How to read the numbers

| Number | What it tells you | How noisy |
|---|---|---|
| `probes.skill` | Exam score of the living gene pool minus random brains. The headline. | One reading swings about ±40% with no rule change (1789 at day 2054, 985 at day 2063). Read the **5-cycle average** only. |
| `probes.learningGain` | Exam score with learning minus without. Below 0: learning hurts. Near 0: brains ignore it. | ±300 on one reading. |
| `probes.memoryGain` | Exam score with memory minus without. | +50 to +1400 on single readings. |
| `avgBrain`, `medianFitness`, `largestCluster`, `brickCells`, `commSeparation` | Context. | 5 to 55% between two runs of identical code. Never decide on these. |
| t in an A/B table | Paired difference divided by its standard error. | "better" needs t above the 5% critical value (2.13 for 5 replicates) and at least a 2% change. |

Rules of thumb:
- A single number never proves anything. Compare averages, or use the verdict column of `loop/ab.js`.
- An evolution experiment with the default size (5 replicates, 60,000 ticks, 200 genomes) can detect an effect
  of roughly 13% or more. A smaller true effect will read "no-effect". That is a limit of the test, not proof of zero.
- About 1 kept result in 20 is luck. Before building on a kept change, check that the live 5-cycle average
  moved the same way within about 10 cycles. If it did not, say so in the CHANGELOG and do not stack more on it.
- `node loop/ab.js --aa` shows today's noise floor. Run it whenever a result surprises you.

## 3. Which test for which change

| Kind of change | Screen (in the cycle) | Verdict (GitHub Actions) | Target metric |
|---|---|---|---|
| World difficulty (`ENV` in `brain.js`) | `run-headless.js --dry --era --no-bench --ticks=6000 --compare=loop/metrics.json`, then the step-size check in section 4 | evolution experiment | the exam task the pressure trains (`probes.thirst`, `probes.scarce`) or `probes.evolved` |
| Selection (who breeds, who dies) | same era screen | evolution experiment | `probes.evolved` |
| Brain, learning rule, senses, actions | `ab.js --instant` | evolution experiment | `probes.learningGain`, `probes.memoryGain` or `probes.evolved` |
| Removing a bonus or special case | `ab.js --instant` | evolution experiment with `--simplify` | `probes.evolved` |
| Speed or refactor that must not change behaviour | CI determinism, plus a 1,500-tick `--dry --no-bench` run that gives identical metrics before and after | experiment with `--simplify --ticks=6000 --replicates=2` | `probes.evolved` |
| New exam task | none | lands together with the first change that needs it | the new task |

Size and time of an experiment: minutes on GitHub Actions ≈ replicates × ticks / 4000 (the default 5 × 60,000
takes about 75 minutes). Stay under 300 minutes. To detect a smaller effect, raise replicates first (up to 8),
then ticks (up to 120,000), with `--replicates=` and `--ticks=` on `submit`.

## 4. Designing an experiment

1. **One change.** If the diff does two things, you cannot tell which one worked. Split it.
2. **Write the prediction first**, in the `--note`: what changes, which metric should move, and why.
   "ENV.thirst 1 -> 1.5: never-drinkers die at age 1480 instead of 2223, so drinking is selected; probes.thirst should rise."
3. **Pick the target that the mechanism moves.** A thirst pressure targets `probes.thirst`, a learning-rule
   change targets `probes.learningGain`. Use `probes.evolved` when the mechanism is general.
4. **Small steps for pressure.** `era-thirst-3x` killed a third of the population in one step. After 60,000
   ticks the survivors scored 37% lower on every exam task, because who lived was decided by where they were
   born, not by what they did. The step-size check, on the 6,000-tick era screen:
   - population more than 10% below `loop/metrics.json`, or
   - one death cause above 50% of all deaths, or
   - median fitness more than 35% below `loop/metrics.json`
   → the step is too big: halve the distance to the current value and screen again.
   Climb in a ladder (×1.25 to ×1.5 per step) and let each step be kept before the next is submitted.
5. **Do not repeat a reverted experiment.** A variation is allowed if the note says what is different and why
   that difference should matter. Give it a new id (`era-thirst-1.5x`, not `era-thirst-3x-again`).
6. **At most 2 running.** Two experiments that touch the same lines will conflict when harvested; pick the second
   one from a different file or a different roadmap phase.

## 5. Reading a result

- **keep**: the patch is applied by `harvest`. Record the numbers in the CHANGELOG and tick the item in ROADMAP.
- **revert, target "worse"**: the change does harm at this size. For a pressure, try half the step. For a
  mechanism, drop it, and write in the ledger what the secondary metrics showed.
- **revert, target "no-effect"**: three possible reasons, check them in this order:
  1. *The effect is smaller than the test can see.* If the difference has the right sign and t is above 1,
     resubmit once with 8 replicates (new id ending in `-r8`).
  2. *A prerequisite is missing.* A better learning rule cannot show a gain while nothing in the world needs
     learning. Move on to the item that creates the need, then come back.
  3. *The idea is wrong.* Leave it reverted.
- **guardrail tripped**: treat as "worse".
- **overdue** (no result after 12 hours): the workflow failed. Record it in the CHANGELOG. Resubmitting under a
  new id (`<id>-b`) is fine; leave the old spec in place, its result will simply never arrive. If two in a row
  go overdue, stop submitting and write an `INCIDENT:` entry: a human has to look at GitHub Actions.
- **keep, but the patch conflicts**: `harvest` marks it `untested`. Re-make the same change by hand on current
  master and submit it under a new id with a note that points to the first result.

## 6. Phase by phase: the reasoning, and what to do when it stalls

### Phase 1: switch selection back on
*Why first:* without it nothing else can spread. Evidence: population on the cap 81% of the time, 45% eligible
to breed at any moment, 1.3% die before adulthood, 35% of deaths are Nodlings that never drank.

*Order inside the phase:* prefer changes that add selection **without** mass death. `breed-by-surplus` and
`soft-cap` reward good foragers directly and kill nobody extra, so try them before more pressure steps.
Pressures (thirst, food, predators) come as ladders (section 4).

*If the phase stalls (3 experiments in a row not kept):*
- Check the mutation load. Every birth perturbs 50% of all weights (`mutateGenome` in `brain.js`). With weak
  selection that erases skill as fast as it is found, and it is the likely reason skill swings so much. Try
  `mutation-rate-half` (0.5 to 0.25 for weights, 0.3 to 0.15 for plasticity), target `probes.evolved`.
- Check that the exam still discriminates: `probes.evolved` should be at least 3x `probes.random`. If random
  brains score close to evolved ones in a task, the task is broken, not the Nodlings.
- Lengthen the experiments (8 replicates, 100,000 ticks). Selection effects need generations; a generation is about 1,500 ticks.

*Done when:* the gate in ROADMAP holds. Then write the date and the numbers under the phase heading.

### Phase 2: learning that pays
*Why:* the learning rule strengthened whatever was active whenever reward was positive, and reward was almost
always positive, so learning pushed weights to the clamp and cost 5 to 13% of the exam score. `reward-baseline`
(kept on 13 November) made it neutral. Neutral is not useful yet.

*The key insight:* evolution will only keep learning if there is something **genes cannot know in advance**.
In a world that is the same every lifetime, instinct beats learning. So after the rule fixes (items 2 to 4),
item 5 (`things-genes-cannot-know`) is the one that decides the phase. Do not skip it.

*If the phase stalls:*
- Count plastic connections: the share of connections with `pl != 0` in the living pool. If it is near zero,
  evolution has switched learning off and no rule fix can show a gain; make item 5 first.
- Check the reward signal a Nodling actually gets: after `reward-baseline` its long-run mean should be near 0.
  If the bonuses dominate it, phase 4 (removing bonuses) may have to come before more learning work.

### Phase 3: memory and planning
*Why:* memory is the one faculty that already pays (+30 to 40% on most readings), so it can be grown by making
the world need more of it: food far from water, food that moves with the seasons, food that keeps in a cache.
Each new demand needs its own exam task, added in the same change, or the gain cannot be seen.

*If it stalls:* the two memory cells may be full. Add outputs `mem2`, `mem3` with matching senses (see
section 8 on adding senses: old genomes must keep working).

### Phase 4: strip the scaffolding
*Why:* the 45 reward bonuses are behaviour written by hand. They also drown the learning signal. Remove them in
groups of 5 to 8 with `--simplify`: the group goes unless the exam score gets measurably worse.
Start with construction geometry (corner, notch, gap, tower, shore, mixed, winter-build), because villages are
not the goal. Villages may shrink. That is acceptable: `largestCluster` is not a target.

### Phase 5: social intelligence
*Why last:* signalling and cooperation only evolve when individuals already face problems worth solving
together. Add the measurement first: `commGain` = exam score minus the score with the hearing senses (22 to 24)
blanked, as a new ablation in `PROBE_TASKS`. Then add problems one Nodling cannot solve alone.

### Phase 6: open-endedness
Islands with rare migration, and a curriculum that raises `ENV` by one ladder step whenever the 5-cycle
average of skill has been flat for 10 cycles.

## 7. Pitfalls, each one learned the hard way

| Pitfall | What happened | Rule |
|---|---|---|
| Deciding on one run | 102 changes were kept on single noisy runs; nothing improved for a month | Only `ab.js` verdicts count |
| Keeping because "guardrails pass" | Same month | No measurable gain means revert |
| A pressure step that is too big | `era-thirst-3x`: exam scores -37% | Ladder steps, section 4 |
| Judging a harder world by fitness inside it | "variable years" and "migrating fallow" were reverted for lowering fitness | Judge by the exam after evolution |
| Reward bonuses and village perks | 45 bonuses and a 2,700-cell village built by reward shaping | Banned |
| Tuning a knob on noise | `LEARN_RATE` raised twice while learning was harmful | Knobs go through experiments too |
| A benchmark that measures the wrong thing | The old gap measured how fast a colony fills a map | Do not change the exam; add tasks |
| Editing the exam to make a result look better | Not yet. Do not be the first | `EXAM`, `PROBE_TASKS`, probe seeds are fixed |
| A stale local `origin/master` | A comparison against old code looked like broken determinism | `git fetch origin master` before comparing |
| Commands cut off at 10 minutes | Batches lost | `ab.js` resumes: run the same command again. Halve `--ticks` for a batch |
| Deleting or regenerating the world | Would erase 4,300 generations | Never delete `loop/world.json.gz` |
| Force push | Blocked by the ruleset on purpose | Never |

## 8. Technical notes that save time

- **Determinism is a feature.** The same snapshot, code and ticks give identical metrics. If two identical runs
  differ, something reads the clock or `Math.random`; find it before doing anything else.
- **Adding a sense or an output.** `N_SENSES` and `OUTPUTS` in `brain.js` define neuron ids. Append new senses
  at the end and raise `N_SENSES`; the bias id is `nIn`, so existing genomes shift. Do it only with a migration
  in `restoreWorld` that remaps old ids, and test by resuming the saved world for 1,500 ticks. If that is too
  much, reuse an existing sense slot that the ablation shows is unused.
- **Adding an exam task.** Add a key to `PROBE_TASKS` in `metrics.js` and to the task lists in
  `loop/run-headless.js`. Tasks set `ENV` values; the exam restores `ENV_LIVE` afterwards. A new task is not
  part of `probes.skill` until a human or a later roadmap edit says so, so old and new skill stay comparable.
- **Adding an `ENV` parameter.** Add it to `ENV` and to `EXAM` (with the neutral value), and multiply it in at
  the one place it acts. Default must be neutral: prove it with the identical-metrics check.
- **The self-test guards the machinery.** If `selfTest()` fails, the change broke the brain math; do not weaken the test.
- **Emergency revert.** If a baseline batch trips a guardrail right after a patch was harvested, undo that one
  patch with `git apply -R loop/experiments/<id>/change.patch`, run `node loop/ci-check.js`, commit as
  `cycle: INCIDENT revert <id>`, and log it. This is the only sim change the loop may commit directly.

## 9. Build-ready designs for the harder roadmap items

These are specified in advance so that implementing them is mechanical. File and function names are as of November 2026.

**`breed-by-surplus`** (phase 1). In `Nodling.tick`, the breeding roll is `0.008*(1 - crowd…)*(1 + nov*1.5)`.
Multiply it by `surplus = 0.5 + 1.5*Math.min(1, (this.energy - 115)/105)` (0.5 at the threshold, 2.0 at 220
energy). Nothing else changes. Prediction: better foragers out-breed the rest; `probes.evolved` and `probes.scarce` rise.

**`soft-cap`** (phase 1). Remove `&& w.pop < POP_CAP` from `eligible`. In the metabolism line add a crowding cost:
`+ Math.max(0, w.pop - POP_CAP*0.8) / (POP_CAP*0.2) * 0.03` energy per tick (zero below 80% of the cap, 0.03 at
the cap, more above it). Keep a hard stop at `POP_CAP*1.3` for compute. Screen with the era screen: the
population should settle between 80% and 110% of the cap. Prediction: the weakest starve instead of the lucky breeding.

**`predators-matter`** (phase 1). In `predators.js` replace `w.predCount < PRED_CAP` with
`w.predCount < Math.max(PRED_CAP, (w.pop * ENV.predators / 100) | 0)` and add `predators: 0` to `ENV` and `EXAM`
(0 keeps today's cap of 6). Ladder: 1.5, then 2.5, then 4 predators per 100 Nodlings. Predators also need to
find prey to breed, so check on the era screen that their number actually rises.

**`eligibility-trace`** (phase 2). In `Brain`, add `this.trace = new Float64Array(conns.length)`. Every `step`,
for each plastic synapse: `trace = trace*0.9 + pre*post`. When reward is non-zero, update with
`w += lr * pl * reward * trace` instead of `pre*post`. Cost: one more multiply per plastic synapse per step.
The snapshot does not need the trace. Update the self-test expectation only if it still shows a weight change under reward.

**`evolvable-learning-rate`** (phase 2). Add `g.lr` to Nodling genomes (default 1 when missing: `g.lr ?? 1`),
mutate like `diet` (`± 0.1`, clamp 0 to 3), crossover picks one parent's value, and use
`LEARN_RATE * this.boost * ENV.plasticity * lrGene` in `Brain.step` (pass the gene into the `Brain` constructor).
Report the population mean of `lr` in `loopMetrics`: if evolution drives it to 0, learning is still not worth having.

**`things-genes-cannot-know`** (phase 2, the decisive one). Two flora variants, `flora` and `flora2`, same look
to every existing sense. Each in-world year, a world-level bit (drawn from the world RNG at year start) says
which one is nourishing (42 energy) and which is poor (4 energy). Add one sense that gives the variant of the
nearest flora (+1 or -1). A Nodling can only know which is good by eating both and noticing the difference, and
it must relearn every year. Exam task `relearn`: the same world with the bit flipped at tick 1,500 of 3,000.
`learningGain` on that task is the number to watch. Needs the sense migration from section 8.

**`commGain` ablation** (phase 5). In `PROBE_TASKS` add `noHearing: { senseMask: [22, 23, 24] }`, report
`probes.commGain = base - noHearing`. Today it should be near zero; that is the baseline.

## 10. Keeping the plan alive

- When a gate is met, write the date and the 5-cycle averages under that phase in ROADMAP and move on.
- When a queue item gets a verdict, append it to the item in ROADMAP (kept or reverted, with the numbers).
- When a queue runs empty before its gate is met, use the "if the phase stalls" list above, then add new items
  to the ROADMAP queue with a one-line reason each. New items must serve the gate of the current phase.
- Never delete a finding or a verdict from ROADMAP or the ledger. Wrong ideas are data.
- Changes to ROADMAP, RULES, this playbook and the routine prompt are documentation: they may be committed
  directly, in a commit of their own, with a CHANGELOG line that says what changed and why.
- When in doubt between a clever option and a boring one, take the boring one and measure it.
