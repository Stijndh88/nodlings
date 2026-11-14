# World notes (World 2)

How the world works, in plain words. The exact numbers are in `materials.js` (one row per material) and at the
top of `world.js`, `nodling.js` and `brain.js`. The notes on the first world are in `archive/v1/`.

## The one idea

Nothing a Nodling does is scripted or paid for. Things have properties, a handful of rules act on those
properties, and a Nodling feels only its own body. If something useful can be done with a thing, a Nodling can
stumble on it, feel that its body is better off, and do it again.

## Materials

Each material is a row of numbers: how heavy, how hard, how long it burns, how nourishing, how it smells and
looks, whether it floats, whether it is sharp, how fast it rots, what it turns into when heated or broken.

| Material | Worth knowing |
|---|---|
| wood | burns long, floats, breaks into two sticks |
| stick | light fuel, floats |
| stone | heavy and hard, breaks into two flakes |
| flake | hard and sharp, light |
| clay | found on the shore, bakes into brick next to a fire |
| brick | hard, insulates best |
| the two plants | look different (the eye reports +1 or -1). Each year one kind nourishes and the other is mildly poisonous, and at new year they swap |
| seed | a small bite, or a new plant if left lying |
| meat | from a killed animal; rots fast; cooks next to a fire |
| cooked meat | the best food there is, keeps longer |

## The rules

- **Carry.** A heavier load makes every step cost more energy.
- **Place.** Dropped on water, a floating thing becomes a bridge and a heavy thing sinks. Dropped on a fire,
  fuel feeds it. Dropped on a pile, it stacks. Three high is a wall that blocks Nodlings and predators; four is the limit.
- **Strike.** The force of a blow is the hardness and weight of what is in the hand (a bare hand is weak). A blow
  harder than its target breaks it or kills it. A sharp thing counts double against soft targets. Two hard
  things struck together may spark, and a spark lights fuel. A blow that cannot break a pile knocks its top off.
- **Heat.** Fire burns through its fuel, may spread to fuel next to it, warms the cells around it, cooks and
  bakes what lies beside it, and hurts whoever stands in it.
- **Decay.** Everything rots at its own rate. Plants spread next to their own kind and near water. The untouched
  world keeps a stock of wood, stone and clay and never stacks anything above 2.

## The creature

- **Body.** Energy (food), water, body temperature and pain. Empty energy or water is death; so is long cold.
- **Senses.** 74 numbers, all properties: its own body, the thing in its hand, the cell ahead and the cell
  underfoot (hard, fuel, smell, look, heat, height), directions to the nearest water, heat, each plant kind,
  flesh, hard things, fuel, walls, animals, predators and Nodlings, what the nearest Nodling is doing and how it
  fares, sounds, its own four memory cells, daylight and season, and where it last drank and ate well.
- **Actions.** Move, grab, drop, use (eat or drink), strike, make a sound, write its memory cells, and `learn`:
  how strongly to learn right now.
- **Brain.** A neural network that grows by mutation over generations (new connections, new neurons, memory
  neurons). The body acts every tick; the brain decides every other tick.
- **Learning in one life.** Some connections are plastic. Each keeps a short fading trace of having been active.
  When the body then feels better or worse than it has come to expect, the traced connections are strengthened
  or weakened. Four inherited "drive" numbers set how much energy, water, comfort and pain count. That is all:
  there is no reward for any particular act.
- **Life.** A year is 8 days (3,200 ticks). A Nodling is a child for one day, and grows old after two years.
  A well-fed adult breeds with the nearest adult; the better fed, the more often. Crowding costs energy, so the
  land sets the population, not a cap.

## Other animals

Critters graze and can be killed for meat with something solid in the hand (a bare hand or a stick is too weak). Predators have their own
small evolving brains, bite rather than kill outright, cannot cross walls or water, and can themselves be killed
by a very hard blow.

## What we watch

- **The exam.** Adults from the living world are copied into fixed test worlds for a year and a half, without
  births. The score is how long they live plus their children. Random brains sit the same exam for comparison.
- **Switched-off tests.** The same exam with learning off, memory blanked, hands tied, or other Nodlings made
  invisible. The drop in score is what that faculty is worth.
- **The technique ledger.** Every outcome of every action is counted as (action, kind of thing in hand, kind of
  target, result), with the share of Nodlings that did it. Nothing is rewarded for appearing there.
- **World health.** How much land is wall and whether every Nodling can still walk to water.

## The browser view

Drag to pan, scroll to zoom, click a Nodling to follow it, click empty ground to drop the selected material.
Every sidebar number has a `?`. The Observations button opens the log of an automated observer that notes
milestones (the first time each technique is seen) and problems once per in-world day. "Loop world" loads the
world the research loop is running.
