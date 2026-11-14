# Nodlings roadmap

**Goal: Nodlings that invent uses for things and change their own behaviour, without anyone scripting it.**
We never pay for a behaviour. We build a world where useful combinations exist, give the Nodlings the senses
and the learning to find them, count what they do (technique ledger) and measure what it is worth (the exam).

> **Status, 14 November 2026: World 2 is live.** The foundations audit
> ([docs/AUDIT-2026-11.md](docs/AUDIT-2026-11.md)) showed that the first world could not lead to invention.
> Stijn approved a rebuild on 14 November. World and creature were rebuilt (stages S0 to S3 below) and a new
> world started at generation 0. The first world is kept in [`archive/v1/`](archive/v1/README.md) (state,
> history, old roadmap and playbook) and its code on the branch `v1-final`. **The loop works on phase W1.**

This file is the plan the autonomous loop follows (`loop/ROUTINE_PROMPT.md` points here).
[`loop/PLAYBOOK.md`](loop/PLAYBOOK.md) explains the reasoning, how to design and judge experiments, the
pitfalls and what to do when a phase stalls.

## Principles

1. **One small rulebook over properties.** Materials are rows of numbers in `materials.js`. The rules (carry,
   place, strike, heat, decay) read properties and never a material name. `test/rules.test.js` enforces it.
2. **Nodlings see properties, not names.** Hardness, fuel, smell, look, heat, height, of what is in the hand,
   ahead and underfoot. A new material is visible the moment its row exists.
3. **Only the body rewards.** The learning signal is the change in energy, water, comfort and pain, weighted by
   four evolved drive genes. No bonuses, no curiosity term, no exceptions.
4. **Lives long enough to learn.** A year is 3,200 ticks. Adults live about one to two years; some reach three.
   Each year the nourishing and the poisonous plant kind swap, so genes cannot know which is which.
5. **Nothing piles up forever.** Every item rots. Nature never stacks above 2; a wall is always somebody's work.
6. **Invention is counted, never paid.** The technique ledger records what is done; switched-off tests on the
   exam say what a faculty is worth.
7. **The exam is fixed; the world is not.** The live world changes through `ENV` (in `brain.js`) and material
   rows. The exam pins its own settings, so scores stay comparable.
8. **No verdict without replicates.** A change is "better" only when the paired difference over several
   replicates clears a one-sided 5% t-test (`loop/ab.js`). No effect means not kept.
9. **Pressure in small steps.** A step that kills a third of the population replaces selection with luck.

## What World 2 is (as built)

| Part | File | In one line |
|---|---|---|
| Materials | `materials.js` | 11 rows: wood, stick, stone, flake, clay, brick, two plants, seed, meat, cooked meat |
| Rules | `physics.js`, `world.js` | carry (mass costs energy), place (sink, bridge, feed a fire, stack), strike (break, knock down, spark, kill), heat (burn, cook, bake), decay (rot, regrow) |
| Senses | `senses.js` | 74 numbers: body, item in hand, cell ahead, cell underfoot, directions to nearest water, heat, each plant kind, flesh, hard things, fuel, walls, animals, Nodlings, predators, what the nearest Nodling does and how it fares, sound, memory, season, daylight |
| Actions | `actions.js` | move, grab, drop, use (eat or drink), strike, sound, 4 memory cells, `learn` (how strongly to learn right now) |
| Learning | `brain.js` | each plastic connection keeps a fading trace of its recent activity; when the body gets better or worse than expected, the trace is strengthened or weakened |
| Body | `nodling.js` | energy, water, temperature, pain; breeding by energy surplus with the nearest adult; crowding costs energy |
| Exam | `metrics.js` | tasks `base`, `scarce`, `thirst`; switched-off tests for learning, memory, hands, social senses |
| Ledger | `actions.js`, `metrics.js` | every action outcome as (verb, class in hand, class of target, result), with the share of Nodlings doing it |
| Tests | `test/` | one file per concern: physics rules, the "no names, body-only reward" rules, and a proof that the learning rule can learn and relearn the plant kinds |

### Stages of the rebuild

| Stage | What | Result |
|---|---|---|
| S0 | Pause the loop, keep the old world | Done 14 November: branch `v1-final`, state in `archive/v1/` |
| S1 | Materials and rules, tests | Done: 21 physics tests, 10 rule tests |
| S2 | Creature: senses, actions, learning, selection | Done: learning test passes (learns the good plant, relearns after the swap, learns nothing with learning off); a fresh world from random brains holds a population |
| S3 | Exam, ledger, dashboard, fresh world | Done: see "Baseline" below |
| S4 | The loop resumes with phase W1 | In force |

### Baseline (first 204,000 ticks of the new world)

Measured every 12,000 ticks on the live world (`loop/history.jsonl`, cycles 1 to 18, 216,000 ticks, 67 years,
138 generations). Averages of cycles 14 to 18:

| Number | Value | Reading |
|---|---|---|
| `probes.evolved` against `probes.random` | 2,840 against 659 | Evolved brains score 4.3x random ones. They were at 1.7x after the first cycle. The S3 gate is met |
| `base` / `scarce` / `thirst` | 3,987 / 2,055 / 2,479 | Out of a possible 4,800 on survival alone |
| Exam cohort alive at the end | 16% | Most adults still die within the year and a half. Plenty of room |
| `learningGain` | -289 | Learning still hurts a little. Evolution has not found the wiring that the learning test proves exists |
| Exam `badMealShare` | 0.37 | Slightly better than eating both kinds alike (0.5), and flat since cycle 1. Phase W2 |
| `handsGain` | -437 | Handling things costs more than it brings so far. Phase W3 |
| `memoryGain`, `socialGain` | -28, +32 | Noise around zero |
| Population | 162 on average (100 to 240), never below life support after cycle 1 | Set by food and winter, not by a cap |
| Deaths in the last cycle | cold 60%, starved 30%, thirst 7%, predators 2%, age 1% | Winter is the main killer. See W1 |
| `wallShare`, `canReachWater` | 0.001, 1.0 | The world stays open |
| Ledger | 13 common technique types, 3 with an item in the hand or placed | 36% of Nodlings lay floating wood on water, about 40 times each. Nobody pays them for it. Whether it helps them (for example to get away from predators) is not yet known |

Until cycle 17 `canReachWater` was undercounted (0.88 to 0.98): a Nodling standing in water because its bridge
had rotted counted as cut off. The measure was corrected on 14 November; such a Nodling can drink and walk out.

## Phases

Each phase has a gate. The loop works on the lowest phase whose gate is not met and takes its hypotheses from
that phase's queue (top first), or invents one that serves the same gate. Always read **5-cycle averages**.

### W1: survival is earned

A world where random brains survive a little and good brains survive a lot, with no single cause of death
swamping the rest.

Queue:
1. `w2-noise-floor` (engineering, no experiment): run `node loop/ab.js --aa` once and write the per-metric
   noise into PLAYBOOK section 2. Until then treat any single-cycle change under 30% as noise.
2. `w2-winter-relief`: cold is 60% of deaths at the baseline, which is at the limit of the gate below. Before
   any other pressure, step `ENV.cold` DOWN from 1 to 0.8 and see whether skill then separates breeders better.
   Target `probes.evolved`. Do not raise `ENV.cold` while cold is above 40% of deaths.
3. `w2-thirst-ladder`: `ENV.thirst` 1 to 1.25 (a drink lasts 1,320 ticks). Target `probes.thirst`.
4. `w2-predator-ladder`: `ENV.predators` 2.5 to 3.5 per 100 Nodlings. Target `probes.evolved`.
5. `w2-mutation-rate`: weight mutation chance 0.3 to 0.2 per connection (`mutateGenome` in `brain.js`). With
   longer lives there are fewer generations, so each child should keep more of what worked. Target `probes.evolved`.

**Gate:** 5-cycle average of `probes.evolved` at least 3x `probes.random`; `canReachWater` above 0.9 and
`wallShare` below 0.2 in every cycle; no death cause above 60% of deaths over 5 cycles.

### W2: learning pays

The yearly swap of the plant kinds is on from the start. The learning test proves the rule can solve it with
one connection; evolution has to find that wiring.

Queue:
1. `w2-bad-food-ladder`: `BAD_FOOD` -10 to -16 (`materials.js`). The worse a wrong meal, the more telling the
   kinds apart is worth. Target `probes.learningGain`.
2. `w2-plasticity-mutation`: the chance that a child's connection changes its plasticity, 0.2 to 0.4
   (`mutateGenome` in `brain.js`), so evolution searches the learning wiring faster. Target `probes.learningGain`.
3. `w2-trace-length`: `TRACE_DECAY` 0.9 to 0.8 or 0.95 (two experiments). Target `probes.learningGain`.
4. `w2-second-secret`: a second fact genes cannot know, for example which of two shore materials bakes into
   the harder brick this year. Needs a design note in this file and Stijn's go-ahead (it adds world state).

**Gate:** 5-cycle average of `probes.learningGain` above zero and "better" in an instant test with learning
off as the control; exam `badMealShare` below 0.35 (0.5 is eating both kinds alike).

### W3: hands pay

Queue:
1. Read the ledger first. Which hand techniques have a share above 5%, and do their users out-breed the rest?
2. `w2-hunt-pays`: critters are worth more or are easier to find, so striking with a stone in hand pays within
   one life. One number at a time (`food` of meat, critter count).
3. `w2-fire-pays`: winter already kills most Nodlings, so warmth is worth a lot. Check the ledger for fires being
   fed (`drop / fuel / fire / feed`); if nobody ever stands by a fire, raise how far a fire warms, one step.
4. `w2-spark-rate`: `SPARK_CHANCE` 0.25 to 0.4, if fires are never lit on purpose.

**Gate:** `probes.handsGain` measurably above zero (5-cycle average, and an instant test), and at least 3 tool
techniques (`toolTechniques`) with a share of 20% or more.

### W4: copying

Add an `imitate` gene (how strongly a Nodling's own trace is also written by what its neighbour does and how
the neighbour fares) and the `cultureGain` test: children raised beside experienced adults against children
raised alone. This changes the creature, so it needs a design note here and Stijn's go-ahead before the loop builds it.

**Gate:** `cultureGain` measurably above zero.

### W5: open-ended

New material rows and new places (islands, caves), one at a time, without new rules. Gate per addition: a
ledger type involving the new material appears and its users out-breed non-users.

### Engineering track (any cycle may take one of these instead of a hypothesis when nothing is ready)

- Speed: the sim does about 400 ticks per second at 200 Nodlings. Profile before optimising; metrics must stay bit-identical.
- A probe regression test in `test/` (fixed genomes give a fixed score).
- Showcase: a brain viewer and a ledger panel in `index.html`.

## What not to do

- No reward bonuses, no curiosity or novelty terms, no survival perks. Ever.
- No material name in a rule. No item that never rots.
- No keeping a change because "guardrails pass". No effect means revert.
- No judging a harder world by fitness inside that world.
- No more than 2 experiments running at once; no experiment that changes more than one thing.
- No new verb, sense, output or kind of world state without a design note here and Stijn's go-ahead. New
  material rows and new values of existing numbers are ordinary loop experiments.
- Do not reuse an experiment id from World 1 (`archive/v1/experiments/`): start every new id with `w2-`.
