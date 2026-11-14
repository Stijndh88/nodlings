# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is **skill**: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). **Learning gain**, **hands gain** and **memory gain** show whether they actually use learning, their hands and memory. The glossary at the bottom explains every number.

Updated 2026-11-14T07:29Z. Now: day 90, skill **1381**, learning gain -84, memory gain 107, brain size 64.6, max generation 25. The plan is in [ROADMAP.md](../ROADMAP.md).

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | skill | learning gain | hands gain | memory gain | techniques | brain | max gen |
|---|---|---|---|---|---|---|---|---|
| 3 | 90 | 1381 | -84 | 163 | 107 | 13 | 64.6 | 25 |
| 2 | 60 | 1318 | 126 | 72 | 217 | 16 | 62.7 | 16 |
| 1 | 30 | 439 | 3 | -62 | 14 | 6 | 61.5 | 6 |

## Latest hypotheses



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
