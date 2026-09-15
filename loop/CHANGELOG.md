# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — STRUCTURAL: alarm-call reward shaping — `kept`

Priority signal 2 (communication): the sound channel had no cost and no
benefit tied to it, so nothing pushed emission toward any meaning. Added a
small reward (`+0.1`) for a Nodling whose *last* decision emitted a strong
sound (`|out.sound| > 0.15`) while a predator was actually nearby
(`lastThreat > 0.3`) — a minimal threat→sound (alarm-call) gradient on the
emitter side, per RULES.md's "alarm→flee" example. Implemented in
`nodling.js`: new `this.lastThreat` field, captured at each decision tick
alongside `this.lastOut`, and folded into the reward formula.

Before (baseline, day 51.7): population 250, fitness 5423, built 630.
After (validation, day 61.7): population 251, fitness 6006 (+10.7%), built 424.
Guardrails: pass (no population/fitness drop; self-test passed).
