# Nodlings playbook (World 2)

How to carry this project forward, written so that any model (or person) can do it well without having been
there when the plan was made. `ROADMAP.md` says **what** to work on. `loop/RULES.md` and
`loop/ROUTINE_PROMPT.md` say **what to do each cycle**. This file says **why**, **how to decide**, and **what
to do when the rules do not cover the situation**.

If this file and your own intuition disagree, follow this file. Every rule here exists because the opposite
was tried and failed; the incident is named next to the rule. The playbook of the first world is in
`archive/v1/PLAYBOOK.md`, and the measurements that ended that world are in `docs/AUDIT-2026-11.md`.

## 1. The idea in six sentences

1. A behaviour that is paid for by a bonus is not a discovery. In the first world bonuses were 68% of what a
   Nodling felt and were worth nothing on the exam.
2. Invention needs a world where things combine: what happens depends on the properties of what is in the hand
   and what it meets, through a few rules, so that useful combinations exist that nobody listed.
3. A Nodling can only use what it can perceive, so it senses properties, and any new material is visible at once.
4. Learning needs repetition and something genes cannot know, so lives span years and the world draws some
   facts fresh each year (which plant kind is good).
5. Evolution only improves what selection can see: a smarter brain spreads only if it leaves more offspring.
6. We never reward an invention. We count it (technique ledger) and measure what it is worth (switched-off
   tests on an exam that never changes, with enough repetitions to beat the noise).

## 2. How to read the numbers

| Number | What it tells you |
|---|---|
| `probes.evolved` | Exam score of the living adults: mean adult ticks lived plus 500 per child, averaged over the tasks `base`, `scarce`, `thirst`. A/B tests use this. |
| `probes.random`, `probes.skill` | The same exam for random brains, and evolved minus random. The headline. |
| `probes.learningGain` | `base` score minus the score with learning switched off. Below 0: learning hurts. Near 0: brains ignore it. |
| `probes.memoryGain`, `handsGain`, `socialGain` | The same for memory senses, for grab/drop/strike, and for the senses about other Nodlings. |
| `probes.badMealShare` | Share of exam meals that were the poisonous kind. 0.5 = cannot tell the kinds apart. The plainest sign of learning. |
| `probes.alive`, `probes.drinks` | Share of the exam cohort alive at the end; drinks per Nodling. |
| `techniques`, `toolTechniques`, `ledger` | Technique types done by at least 20% of the Nodlings active in the batch; those that use an item in the hand or a placed item; and the 30 most widespread types with their share. |
| `wallShare`, `canReachWater`, `openShore`, `emptyLandShare` | World health. Guardrails: `canReachWater` at least 0.9, `wallShare` at most 0.2. |
| `deaths` | Causes since the world started. Read the change between cycles. |
| `avgBrain`, `medianFitness`, `medianAge`, `carrying`, `commSeparation` | Context. Never decide on these. |
| t in an A/B table | Paired difference divided by its standard error. "better" needs t above the 5% critical value (2.13 for 5 replicates) and at least a 2% change. |

Rules of thumb:
- A single number never proves anything. Compare 5-cycle averages, or use the verdict column of `loop/ab.js`.
- Random brains babble. They grab, drop and strike by accident, so a ledger type existing means nothing. A
  share that rises over cycles, in a type whose users out-breed the rest, means something.
- A gain (learning, memory, hands, social) is the difference of two noisy scores. Trust its sign only as a
  5-cycle average or from an instant test.
- About 1 kept result in 20 is luck. Before building on a kept change, check that the live 5-cycle average
  moved the same way within about 10 cycles.
- **Noise floor (A/A, 14 Nov 2026, world at 228,000 ticks, 5 replicates x 60,000 ticks; sd of a paired difference):**
  `probes.evolved` 150 (about 5.5% of 2,650), `base` 262, `scarce` 188, `thirst` 134, `learningGain` 184,
  `memoryGain` 218, `handsGain` 320, `socialGain` 140, `badMealShare` (exam) 0.006, population 10, medianFitness 168.
  The gains have noise larger than any value seen so far: only trust them as 5-cycle averages or A/B verdicts.
- `node loop/ab.js --aa` shows today's noise floor. Run it whenever a result surprises you.

## 3. Which test for which change

| Kind of change | Screen (in the cycle) | Verdict (GitHub Actions) | Target metric |
|---|---|---|---|
| World difficulty (`ENV` in `brain.js`) or a number in `materials.js` | `run-headless.js --dry --era --no-bench --ticks=6000 --compare=loop/metrics.json`, then the step-size check in section 4 | evolution experiment | the exam task the pressure trains, or `probes.evolved` |
| Selection (who breeds, who dies) | same era screen | evolution experiment | `probes.evolved` |
| Brain, learning rule | `ab.js --instant` | evolution experiment | `probes.learningGain` or `probes.evolved` |
| A new material row | era screen, plus `node test/physics.test.js` and `node test/rules.test.js` | evolution experiment; keep only if `probes.evolved` is not worse and the ledger of the treatment worlds shows the material in use | `probes.evolved` |
| Speed or refactor that must not change behaviour | CI determinism, plus a 1,500-tick `--dry --no-bench` run that gives identical metrics before and after | experiment with `--simplify --ticks=6000 --replicates=2` | `probes.evolved` |
| New sense, output, verb, rule or kind of world state | not a loop experiment | design note in ROADMAP and Stijn's go-ahead | |

Size and time of an experiment: an evolution experiment is 5 replicates x 60,000 ticks per arm by default.
Sixty thousand ticks is about 19 years, roughly 20 to 40 generations. Selection effects need generations, so
do not shorten it. To detect a smaller effect, raise replicates first (up to 8), then ticks (up to 120,000),
with `--replicates=` and `--ticks=` on `submit`. Stay under 300 minutes on GitHub Actions.

## 4. Designing an experiment

1. **One change.** If the diff does two things, you cannot tell which one worked. Split it.
2. **Write the prediction first**, in the `--note`: what changes, which metric should move, and why.
3. **Pick the target that the mechanism moves.** A thirst pressure targets `probes.thirst`, a learning change
   targets `probes.learningGain`. Use `probes.evolved` when the mechanism is general.
4. **Small steps for pressure.** In the first world `era-thirst-3x` killed a third of the population in one
   step, and the survivors scored 37% lower on every task: who lived was decided by where they were born. The
   step-size check, on the 6,000-tick era screen:
   - population more than 10% below `loop/metrics.json`, or
   - one death cause above 60% of the deaths in the screen, or
   - median fitness more than 35% below `loop/metrics.json`
   → the step is too big: halve the distance to the current value and screen again.
   Climb in a ladder (x1.25 to x1.5 per step) and let each step be kept before the next is submitted.
5. **Do not repeat a reverted experiment.** A variation is allowed if the note says what is different and why.
6. **Ids start with `w2-`** and are never reused, also not from `archive/v1/experiments/`: results are stored
   by id on the `experiment-results` branch, and a reused id would be read as already finished.
7. **At most 2 running.** Pick the second one from a different file or a different phase.

## 5. Reading a result

- **keep**: the patch is applied by `harvest`. Record the numbers in the CHANGELOG and in the ROADMAP queue item.
- **revert, target "worse"**: for a pressure, try half the step. For a mechanism, drop it and write down what
  the secondary metrics showed.
- **revert, target "no-effect"**: three possible reasons, check them in this order:
  1. *The effect is smaller than the test can see.* If the sign is right and t is above 1, resubmit once with
     8 replicates (new id ending in `-r8`).
  2. *A prerequisite is missing.* A use that does not pay cannot be selected; go and make it pay first.
  3. *The idea is wrong.* Leave it reverted.
- **guardrail tripped**: treat as "worse".
- **overdue** (no result after 12 hours): the workflow failed. Record it. Resubmit under a new id (`<id>-b`).
  If two in a row go overdue, stop submitting and write an `INCIDENT:` entry: a human has to look.
- **keep, but the patch conflicts**: `harvest` marks it `untested`. Re-make the change by hand on current
  master and submit it under a new id with a note that points to the first result.

## 6. Phase by phase: the reasoning, and what to do when it stalls

### W1: survival is earned
*Why first:* nothing spreads unless it means more offspring. The world must be hard enough that skill decides
who breeds, and gentle enough that luck does not.

*What to look at:* `probes.evolved` against `probes.random`; the mix of death causes; `probes.alive`.

*If it stalls (3 experiments in a row not kept):*
- Check the mutation load: every birth changes 30% of the weights. With long lives there are few generations,
  so a child that forgets what its parents knew is expensive. Try the `w2-mutation-rate` item.
- Check that the exam discriminates. If random brains score close to evolved ones on a task, the task is
  broken, not the Nodlings.
- Lengthen the experiments (8 replicates, 120,000 ticks).

### W2: learning pays
*Why it can work now:* the plant swap is something genes cannot know. `test/learning.test.js` proves that one
plastic connection from "look of the plant underfoot" to "use" learns the good kind in about ten meals and
relearns after the swap. Evolution has to find that wiring, and it only will if eating the wrong kind costs enough.

*What to look at:* `probes.badMealShare` (0.5 means no learning), `probes.learningGain`, and the share of
connections with `pl != 0`.

*If it stalls:*
- Does the Nodling see before it acts? A Nodling whose `use` output is always on eats whatever it walks over
  before its brain has looked. That is a real strategy and it beats learning when wrong meals are cheap. Make
  wrong meals dearer (the `BAD_FOOD` ladder), never add a reward for choosing.
- Is the `learn` output stuck near -1 in the living pool? Then evolution has switched learning off because it
  hurt. Look for what makes it hurt (reward noise from crowding or cold) before touching the rule.
- A lineage can also solve the swap without learning, by eating both and breeding fast. That shows as
  `badMealShare` near 0.5 with good scores. It is allowed. Make the poison matter more.

### W3: hands pay
*Why:* in the first world hands were worth 0% on the exam. Here every hand use has to pay through the body:
a stone, a flake or a piece of wood in the hand kills a critter that a bare hand cannot (meat is 70 energy,
cooked 110); only a stone is heavy enough to kill a predator; two hard things struck together spark and light fuel; a fed fire warms a winter night and
cooks; a stack of three blocks a predator; a floating item bridges water.

*If nothing is ever picked up on purpose:* check in this order: can they perceive it (senses), does the use pay
inside one life, does the first step pay on its own. A use that needs three unrewarded steps before any benefit
will not be found. Shorten the chain in the physics (a number in `materials.js`), never with a bonus.

*If a technique appears in the ledger but its users do not out-breed the rest,* it is play, not invention.
Leave it alone. Do not help it.

### W4 and W5
See ROADMAP. Copying (`w2-imitate`) and the second yearly secret (`w2-second-secret`) were approved by Stijn on
14 November 2026 and are specified under "Approved designs" in ROADMAP: build them exactly as written. Anything
else that changes the creature or the world's structure still needs a design note and Stijn's go-ahead first.

*General:* expect weeks per phase. A flat ledger for 30 cycles is a reason to make an existing use more
worthwhile, not a reason to add rewards.

## 7. Pitfalls, each one learned the hard way

| Pitfall | What happened | Rule |
|---|---|---|
| Deciding on one run | 102 changes were kept on single noisy runs; nothing improved for a month | Only `ab.js` verdicts count |
| Keeping because "guardrails pass" | Same month | No measurable gain means revert |
| A pressure step that is too big | `era-thirst-3x`: exam scores -37% | Ladder steps, section 4 |
| Judging a harder world by fitness inside it | Two scarcity ideas were reverted for lowering fitness | Judge by the exam after evolution |
| Reward bonuses | 45 bonuses; 95% of rewarded "builds" were a brick picked up and put back in the same tick | Banned. `test/rules.test.js` fails if the reward reads anything but the body |
| A material that never goes away | Fiber never decayed and bound stacks; after 2,000 days half the land was wall and no Nodling could reach water | Every row in `materials.js` has `rot` above 0. Guardrails on `wallShare` and `canReachWater` |
| Reading a death cause as a behaviour | "35% die of thirst" was read as "a third never drinks"; in fact nobody could reach water | Count the behaviour itself (drinks, meals, ledger), not its consequence |
| Counting an event as a behaviour | See the bonus row | A behaviour exists only if switching it off lowers the exam score |
| A faculty nobody measured | Calling cost 25% of the exam score for months | Every output and sense group gets a switched-off test before anything is built on it |
| A test that tests the wrong thing | The first learning test let the Nodling eat before it had looked, so nothing could be learned and the rule looked broken | When a test of a mechanism fails, print the mechanism's inner numbers before changing the mechanism |
| Editing the exam to make a result look better | Not yet. Do not be the first | `EXAM`, `PROBE_TASKS`, the probe seeds and the score formula are fixed. Tasks may be added by a roadmap phase |
| A stale local `origin/master` | A comparison against old code looked like broken determinism | `git fetch origin master` before comparing |
| Commands cut off at 10 minutes | Batches lost | `ab.js` resumes: run the same command again. Halve `--ticks` for a batch |
| Deleting or regenerating the world | Would erase every generation | Never delete `loop/world.json.gz` |
| Force push | Blocked by the ruleset on purpose | Never |

## 8. Technical notes that save time

- **Layout.** The sim files are in the repo root and are listed, in load order, in `loop/sim-files.js`. A new
  sim file must be added there and to `index.html`.
- **Determinism is a feature.** The same snapshot, code and ticks give identical metrics. If two identical runs
  differ, something reads the clock or `Math.random`; find it before doing anything else.
- **Tests.** `node test/physics.test.js`, `node test/rules.test.js`, `node test/learning.test.js`; CI runs all
  three plus `node loop/ci-check.js`. A change to a rule needs a test in the same patch.
- **Adding a material.** One row in `MATERIALS`. Give it `rot`. If it should appear in nature give it `wild`
  (how many the world keeps in stock). Add a tile in `sprites.js` or it draws as a plain square. Do not touch
  any rule: if the new material needs a new rule, it is a design change.
- **Adding a sense or an output** changes the genome format (`N_SENSES`, `OUTPUTS`): old genomes stop fitting.
  It needs a migration in `restoreWorld` and Stijn's go-ahead. Appending at the end of `SENSE_NAMES` is the only allowed way.
- **Adding an exam task.** Add a key to `PROBE_TASKS` in `metrics.js` and to the task lists in
  `loop/run-headless.js`. A new task is not part of `probes.evolved` until a roadmap edit says so.
- **Adding an `ENV` parameter.** Add it to `ENV` and to `EXAM` (with the neutral value) and multiply it in at
  the one place it acts. The default must be neutral: prove it with the identical-metrics check.
- **The ledger is not saved with the world.** It starts empty at every batch, so its shares describe one batch.
- **Life support.** Below 40 Nodlings the world trickles in one Nodling at a time from the gene bank. It is an
  extinction guard, not a feature: if a cycle ends near 40, the world is too hard. Say so in the CHANGELOG.
- **Emergency revert.** If a baseline batch trips a guardrail right after a patch was harvested, undo that one
  patch with `git apply -R loop/experiments/<id>/change.patch`, run `node loop/ci-check.js`, commit as
  `cycle: INCIDENT revert <id>`, and log it. This is the only sim change the loop may commit directly.

## 9. Hard rules for anyone writing sim code

- **No material name in a rule.** `physics.js` may read `item.fuel`, never `name === 'wood'`.
  `test/rules.test.js` greps the rule files for quoted material names and fails if it finds one.
- **No reward except body change.** The only inputs to the learning signal are energy, water, temperature
  comfort and pain, weighted by the four drive genes. If you want Nodlings to do something, make it useful to
  their bodies or their offspring, or accept that they will not do it.
- **Everything decays.** Nature never stacks above 2.
- **One sense table**, append only.
- **Determinism:** the world RNG is the only source of randomness.

## 10. Keeping the plan alive

- When a gate is met, write the date and the 5-cycle averages under that phase in ROADMAP and move on.
- When a queue item gets a verdict, append it to the item in ROADMAP (kept or reverted, with the numbers).
- When a queue runs empty before its gate is met, use the "if it stalls" list above, then add new items to the
  ROADMAP queue with a one-line reason each. New items must serve the gate of the current phase.
- Never delete a finding or a verdict from ROADMAP or the ledger. Wrong ideas are data.
- Changes to ROADMAP, RULES, this playbook and the routine prompt are documentation: they may be committed
  directly, in a commit of their own, with a CHANGELOG line that says what changed and why.
- When in doubt between a clever option and a boring one, take the boring one and measure it.

## 11. What to tell Stijn, honestly

Small inventions and learned habits are a realistic goal: telling the plants apart, hunting with a stone,
keeping a fire. Consciousness is not. A village is not a goal; if one appears because it keeps Nodlings alive,
the exam will show it first. Stijn is not an AI researcher: say what happened in plain words, lead with the
result, and give numbers only where they carry the point.
