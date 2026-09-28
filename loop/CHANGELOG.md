# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — STRUCTURAL: kept

**Signal:** #2 communication — sound channel exists but carries no evolved
meaning. Construction (#1) already exceeds its target by an order of
magnitude (`built=754` vs the `>=25` milestone) so moved to the next signal.

**Hypothesis:** the emitter already gets a small reward for calling while
food/a predator is nearby (`nodling.js` sound block), but the *listener*
side had no incentive tied to reacting to a heard sound — only the generic
wellbeing signal, which is weak and indirect. Added a listener-side reward:
hearing a sound (`s[22] > 0`) while sensing a real predator threat
(`s[40] > 0.3`) and then moving away from that threat now earns
`+0.15` bonus (same reward channel as everything else, still clamped to
`[-1,1]`) — makes the sound↔danger correlation directly learnable instead
of relying on it to emerge purely from survival outcomes.

**Change:** `nodling.js`, `tick()` — ~6 lines added after the behaviour-
signature tally, inside the existing think block.

**Metrics (day 51.7 → day 61.7, 16000 ticks):**
| metric | before | after |
|---|---|---|
| population | 250 | 250 |
| fitness | 4389 | 4647 |
| avgBrain | 86.6 | 70.8 |
| built | 754 | 382 |
| maxGen | 145 | 25 |

`pass: true` (fitness rose, population held at cap — both guardrail-tracked
metrics improved/unchanged). Note: `maxGen` and `built` both dropped
noticeably within the window; guardrails only compare start/end snapshots,
not mid-run minima, so this isn't caught as a guardrail failure. Given the
`observer.js` "treadmill" warning (population crashing to the reseed floor
resets deep lineages), this pattern is worth watching in future cycles — if
it recurs and correlates with reward-shaping changes, treat it as a signal
even though it isn't a hard guardrail.
