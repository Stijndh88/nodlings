# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel's loop was
half-closed — a caller got a small bonus for emitting near food/a predator,
but nothing rewarded a *listener* for reacting correctly to a heard call, so
alarm→flee / food→approach had no direct selection pressure to become learnable.

**Change:** tag each emitted sound with the context that triggered it
(`'alarm'` if a predator was close, `'food'` if standing on something
nutritious, else untagged) — not exposed as a new sense, only used
server-side. One think-step later, a listener who moved away from an
`'alarm'`-tagged source or toward a `'food'`-tagged source gets a +0.15
reward bump, on top of the existing wellbeing-based reward.

**Before → after (16k-tick validation batch vs. the 80k-tick baseline):**
fitness 4299 → 5136 (+19.5%), population 248 → 252, built 626 → 427 (normal
batch-to-batch variance, not guardrail-tripping), maxGen reset as expected
(new validation window). Guardrails passed.
