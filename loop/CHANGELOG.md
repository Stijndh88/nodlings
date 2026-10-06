# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel had a
caller-side reward (calling near food/a predator earns a bonus) but zero
listener-side reward — nothing made *reacting* to a heard sound pay off, so
a food-call→approach correlation had no selection pressure to become
learnable.

**Change:** `nodling.js` — `sense()` now remembers the most recent heard
sound's direction for a short TTL (20 ticks) in `this.heardSound`. When a
Nodling eats while facing in that remembered direction, it gets a `+0.3`
bonus, reinforcing "a call meant food" for the listener. One new field,
~10 lines.

**Validation (16000 ticks from the day-51.7 baseline):**
| metric | before | after |
|---|---|---|
| population | 251 | 250 |
| fitness | 4952 | 5829 (+17.7%) |
| built | 610 | 471 |

`pass: true`, no guardrail violated. Fitness improved, population held
steady. Note: `maxGen` collapsed 132→24 during this window, but that crash
started in the *baseline* batch (already flagged in observations.md at day
51.7 as a pre-existing reseed/"treadmill" issue, not caused by this
change) — left for a future cycle under priority signal 3.
