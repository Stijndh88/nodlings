# Nodlings

**A small world where creatures with evolving brains live, breed and die, and an autonomous research
loop that tries to make them smarter.** Nobody scripts what a Nodling does. Its brain is a neural network
that evolves over generations and can learn during a lifetime. The project asks one question: can real
intelligence grow here, and can we prove it?

[![The live world](docs/world.jpg)](https://stijndh88.github.io/nodlings/)

**[Watch the live world](https://stijndh88.github.io/nodlings/)** · **[Progress dashboard](loop/dashboard.md)** · **[Roadmap](ROADMAP.md)** · **[Changelog](loop/CHANGELOG.md)** · **[Why the world was rebuilt](docs/AUDIT-2026-11.md)**

## Where it stands

![Nodlings progress](loop/progress.svg)

**World 2 started on 14 November 2026.** The first world ran for 2,063 days and stalled: an audit showed its
Nodlings were paid by 45 hand-written bonuses for things that were worth nothing, were blind to most materials,
lived too briefly to learn, and had walled themselves off from water. It is kept in [`archive/v1/`](archive/v1/README.md).
World 2 was rebuilt around one idea: **never pay for a behaviour; make things useful and let them find out.**

README_TABLE_PLACEHOLDER

## How it works

**The world.** A 200 x 150 continent ringed by ocean, with lakes, seasons, day and night. Materials are rows of
properties (weight, hardness, fuel, food, sharpness, how fast it rots). Five rules act on properties and never
on names: carrying costs energy by weight, a dropped thing sinks, floats, feeds a fire or stacks, a blow breaks
what is softer than the thing in the hand, fire burns, cooks and bakes, and everything rots. Two plant kinds
look different; each year one nourishes and the other is mildly poisonous, and at new year they swap.

**The creature.** A Nodling has energy, water, body temperature and pain. Its brain maps 74 senses (properties
of what it holds, what is ahead and underfoot, what is near, what its neighbour does and how it fares, sound,
memory, season) to 12 outputs (move, grab, drop, eat or drink, strike, call, four memory cells, and how strongly
to learn right now). Brains grow by mutation over generations, and some connections change during life. The
only learning signal is the body: did what I just did leave me better or worse off than I expected?

**The research loop.** An autonomous Claude routine advances the world, measures the Nodlings and tests one
idea at a time:

1. **The exam.** Living adults are copied into fixed test worlds and scored on how long they live and how many
   children they have, in a normal world, a world with little food and a world where thirst bites. Switching one
   faculty off (learning, memory, hands, seeing others) and re-running the exam shows what it is worth.
2. **The technique ledger.** Everything a Nodling does with a thing is counted by kind (for example "strike,
   hard thing in hand, animal, kill") with the share of Nodlings doing it. Counted, never rewarded.
3. **Experiments.** A candidate change is stored as a patch. GitHub Actions evolves five copies of the world
   with the change and five without, then compares exam scores with a t-test. Only proven changes land.

## Run it yourself

No build and no dependencies.

```bash
# watch: open index.html in a browser (or serve the folder and press "Loop world")
python3 -m http.server 8000

# measure the current gene pool on the exam, without touching the saved world
node loop/run-headless.js --dry --bench --ticks=0

# how noisy is the world? identical code, different random streams
node loop/ab.js --aa --ticks=6000 --replicates=3

# test an uncommitted change against HEAD on the current gene pool (about 4 minutes)
node loop/ab.js --instant --target=probes.evolved

# tests and CI gate
for t in test/*.test.js; do node "$t"; done
node loop/ci-check.js
```

In the browser: drag to pan, scroll to zoom, click a Nodling to follow it, click the ground to drop the
selected material. Every sidebar number has a `?` that explains it, and the Observations button opens the
log of an automated observer that records milestones and problems once per in-world day.

## Map of the repository

| Path | What it is |
|---|---|
| `materials.js` | The materials, one row of properties each |
| `physics.js`, `world.js` | The rules (carry, place, strike, heat, decay), terrain, climate, plants, fire |
| `senses.js`, `actions.js`, `nodling.js` | The creature: what it senses, what it can do, its body and breeding |
| `brain.js` | Evolving neural network, learning rule, and `ENV`, the world's difficulty settings |
| `critters.js`, `predators.js` | Wildlife, and predators with their own evolving brains |
| `sim.js` | The tick loop and saving or resuming a whole world |
| `metrics.js` | World health, the technique ledger and the exam |
| `test/` | Tests of the rules, of "no material names, body-only reward", and of the learning rule |
| `index.html`, `main.js`, `render.js`, `sprites.js`, `observer.js` | The browser view |
| `docs/world-notes.md` | How the world works, in plain words |
| `docs/AUDIT-2026-11.md` | The audit that ended the first world, and the design of this one |
| `ROADMAP.md` | The plan: principles, phases with gates, hypothesis queues |
| `loop/RULES.md`, `loop/ROUTINE_PROMPT.md` | What the autonomous loop must do each cycle |
| `loop/PLAYBOOK.md` | Why the plan is what it is, how to design and read experiments, pitfalls, what to do when stuck |
| `loop/run-headless.js` | Advance the saved world and measure it |
| `loop/ab.js` | Replicated paired A/B test with a noise-aware verdict |
| `loop/experiments.js`, `loop/experiments/` | Long evolution experiments that run on GitHub Actions |
| `loop/world.json.gz`, `loop/history.jsonl` | The saved world and its measured history |
| `loop/dashboard.md`, `loop/dashboard.html`, `loop/progress.svg` | Progress pages, rebuilt every cycle |
| `archive/v1/` | The first world: its state, history, roadmap and playbook |

## Design rules

- **No scripted behaviour and no paid behaviour.** The only reward is the body. A test fails if that changes.
- **Properties, not names.** No rule mentions a material. A test fails if one does.
- **Everything rots.** Nothing can pile up until the world is sealed.
- **The exam is fixed; the world is not.**
- **No verdict without replicates.** No measurable effect means the change is not kept.
