# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day 51.7 → 61.7) — kept

**Signal:** #1 (villages) already sustained well past target (`built` 805 at
day 51.7, 32x the `built>=25` milestone, not a one-off spike since it's been
climbing since day 1.3) — moved to **signal #2 (communication)**. The sound
channel had a caller-side reward (`bonus += 0.25` for calling near
food/a predator) but no listener-side reward, so only half the
call→meaning→reaction loop was learnable.

**Change:** added a symmetric listener-side reward in `nodling.js` `tick()`:
when a Nodling has recently heard a sound and a predator is near that sound's
*source* (ground truth, not the heard frequency — frequency itself stays
freely evolvable), moving away from the source earns `bonus += 0.2`. Mirrors
the existing caller-side shaping without hardcoding what any given frequency
means.

**Metrics (before → after, 16000-tick validation):**
| metric | before | after |
|---|---|---|
| population | 249 | 250 |
| fitness | 4993 | 5565 |
| built | 805 | 546 |
| maxGen | 143 | 29 (population/gene-pool reseed mid-window, deep winter — not guardrail-tripping, pop back at cap) |

`pass: true` — fitness up, population at cap, no guardrail violations. **kept**.
