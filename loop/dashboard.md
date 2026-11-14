# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is **skill**: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). **Learning gain**, **hands gain** and **memory gain** show whether they actually use learning, their hands and memory. The glossary at the bottom explains every number.

Updated 2026-11-14T12:28Z. Now: day 630, skill **2314**, learning gain -490, memory gain 379, brain size 94.7, max generation 157. The plan is in [ROADMAP.md](../ROADMAP.md).

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | skill | learning gain | hands gain | memory gain | techniques | brain | max gen |
|---|---|---|---|---|---|---|---|---|
| 22 | 630 | 2314 | -490 | -389 | 379 | 0 | 94.7 | 157 |
| 21 | 630 | 2314 | -490 | -389 | 379 | 13 | 94.7 | 157 |
| 20 | 600 | 2156 | 26 | 0 | 33 | 13 | 92.1 | 148 |
| 19 | 570 | 2300 | 34 | 49 | 267 | 13 | 91.2 | 141 |
| 18 | 540 | 2251 | -139 | -172 | 179 | 13 | 91 | 138 |
| 17 | 510 | 2293 | -16 | -17 | 407 | 13 | 88.3 | 132 |
| 16 | 480 | 2352 | -296 | -90 | -62 | 13 | 86.4 | 123 |
| 15 | 450 | 2097 | -308 | -880 | -348 | 13 | 83.8 | 117 |
| 14 | 420 | 1913 | -687 | -1027 | -315 | 10 | 83.5 | 107 |
| 13 | 390 | 2082 | -426 | 2 | 442 | 10 | 83.7 | 101 |
| 12 | 360 | 2193 | 369 | -138 | 201 | 9 | 83.2 | 91 |
| 11 | 330 | 2245 | -108 | 493 | 330 | 10 | 81.8 | 85 |
| 10 | 300 | 2153 | -232 | -220 | 498 | 13 | 79.7 | 78 |
| 9 | 270 | 2275 | -521 | -405 | 284 | 9 | 79.2 | 73 |
| 8 | 240 | 2060 | -317 | -332 | 49 | 9 | 76.3 | 66 |

## Latest hypotheses

- **running**: ENV.cold 1 -> 0.8: cold is ~60% of deaths (679 of 1103 in the last batch), so who dies is decided by winter luck. Predict less cold-death noise, so skill separates breeders better and probes.evolved rises. (evolution experiment submitted at 98911b1)

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.

## What do these numbers mean?

**Nodling.** One of the little creatures in the simulation. Each has a small evolving "brain"; nobody scripts what it does and nothing rewards it except its own body feeling better or worse.

**World 2.** The world since November 2026. Materials are rows of properties (mass, hardness, fuel, food...) and a handful of rules act on those properties, so things can be combined in ways nobody listed. The first world paid Nodlings bonuses for behaviours; this one pays nothing.

**What is the loop?.** An unattended routine that keeps the world running. Each "cycle" it simulates a stretch of time, measures how the Nodlings are doing, and tests one small change to the world.

**Day and year.** A day is 400 ticks and a year is 8 days. A Nodling can live about 3 years, so it sees several winters.

**Skill (the headline number).** An exam for the species. A sample of living adult Nodlings is copied into fresh, identical test worlds and scored on how long each lives and how many offspring it has over a year and a half (one winter, and one swap of the good and the poisonous plant). Three tasks: a normal world, a world with little food, a world where thirst bites three times faster. Random brains sit the same exam. Skill is the evolved score minus the random score.

**Learning gain.** The exam score minus the score of the same Nodlings with learning switched off. Positive means that learning during a lifetime helps them.

**Hands gain.** The exam score minus the score with grab, drop and strike switched off. Positive means that handling things (tools, fire, walls) helps them survive. In the first world this was exactly zero.

**Memory gain, social gain.** The same idea for memory and for the senses about other Nodlings.

**Techniques.** The technique ledger counts every kind of thing a Nodling does with an object: the action, what is in its hand, what it acts on, and what happens (for example "strike / hard / animal / kill"). "In common use" means at least 20% of the Nodlings active during the batch did it at least once. Random brains grab, drop and strike by accident, so watch whether the shares rise, not whether a type exists. Nothing is ever rewarded for appearing here.

**Tool techniques.** Techniques that need something in the hand, or something placed to an effect (feeding a fire, bridging water).

**Bad meals.** Each year one of the two plant kinds is nourishing and the other mildly poisonous, and they swap. 50% bad meals means Nodlings eat both alike; a lower number means they learned which is which.

**World health.** wallShare (how much land is wall), openShore and canReachWater (can Nodlings still walk to water). The first world silted up until nobody could reach water; these numbers guard against that.

**Brain size.** Average number of connections in a living Nodling brain.

**Max generation.** The longest family line alive.

**Instant test.** A quick check of a change: the same living Nodlings sit the exam under the old and the new code, on several sets of test worlds.

**Evolution experiment.** The real test of a change. Several copies of the world evolve with the change and several without it, on GitHub Actions. A change is kept only if the Nodlings that evolved with it score measurably higher on the exam.

**INCIDENT.** A guardrail tripped on a plain run, so the loop stopped changing things and left a note in the changelog for a human to look at.
