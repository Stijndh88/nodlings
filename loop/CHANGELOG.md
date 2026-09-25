# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — sounds audible for 2 ticks instead of 1 (day 51→61)

**Signal:** priority 2 (communication) — the sound channel carries no evolved
meaning yet. `nodling.tick()` only re-senses on the tick matching a
Nodling's `phase` (thinks every other tick). Sounds previously lived for
exactly 1 tick (`world.sounds = world.nextSounds`), so a sound emitted on a
listener's "off" tick was already gone by the time that listener next
sensed the world — roughly half the population could never perceive any
given call. That starves the signal↔behavior correlation the sound-caller
bonus (`nodling.js` topNut/predNear bonus) is trying to bootstrap on the
listener side.

**Change:** `world.js` now tracks `prevSounds`; `sim.js`'s tick loop sets
`world.sounds = world.prevSounds.concat(world.nextSounds)` each tick before
rolling `prevSounds = world.nextSounds`, giving every emitted sound a
2-tick audible window — long enough that every Nodling gets at least one
thinking tick inside it regardless of phase parity. No reward magnitudes
or sensory indices changed, just the exposure window.

**Before → after (80k baseline batch vs 16k validation batch):**
- fitness: 4538 → 4856
- population: 233 → 250 (cap)
- built (durable structures): 829 → 388 (shorter batch window, not comparable 1:1)
- day: 51.7 → 61.7

Guardrails passed both runs (`selfTest()` ok, no NaN, population and
fitness within bounds). `kept`.
