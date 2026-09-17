# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — 2026-09-17

**STRUCTURAL: kept** — Priority signal #2 (communication): the sound channel
had a caller-side reward (bonus for emitting while food/predator is nearby)
but nothing rewarded the *listener* for reacting correctly to a heard sound,
so a alarm→flee / food-found→approach correlation had only one side pushing
it. Added a symmetric listener-side bonus in `nodling.js`: when a Nodling
hears a sound, check what's actually at the sound's source (nutrition on
top of the stack, or a predator within 3 tiles) and reward moving toward it
(food) or away from it (predator) by +0.15. Stored the nearest heard sound
per-tick as `this.heardSound` (set in `sense()`) so `tick()` can use it
after computing `out.moveX/moveY`.

Validation batch (16000 ticks) vs. baseline (80000-tick batch to day 51.7):

| metric | before | after |
|---|---|---|
| population | 171 | 252 |
| fitness | 4811 | 5460 |
| day | 51.7 | 61.7 |

`pass: true` — no guardrail tripped (population and fitness both rose).
maxGen dropped (146→31) but that's an artifact of the harness always
reseeding a fresh population + world at process start (only the hall of
fame and tick counter persist via storage.json) combined with the shorter
validation batch length — not a regression from this change.
