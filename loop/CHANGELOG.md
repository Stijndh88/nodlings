# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7→61.7 — `kept`

**Signal:** #1 (villages) is already sustained well past target (`built`=745,
>>25) so moved to #2 (communication) — the sound channel is wired (emit +
nearby Nodlings sense freq/direction) but nothing reinforces using it
meaningfully. `nodling.js`: bumped the informative-call bonus (calling while
food is underfoot or a predator is close) from `0.25` to `0.45` — makes the
existing emit→context correlation more strongly reinforced/learnable,
without hardcoding what the sound *means* (still evolved).

Before: pop=249 fitness=5185 built=745 day=51.7
After:  pop=250 fitness=5730 (+10.5%) built=410 day=61.7

Guardrails passed (no population/fitness drop). Fitness improved; `built`
dropped but stayed far above the 25 milestone and isn't a guardrail metric.
