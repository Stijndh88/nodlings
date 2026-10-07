# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 61.7 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel already
rewards the *caller* for signalling near food/danger (`nodling.js`, the
`out.sound` block), but nothing rewards a *listener* for reacting to a heard
sound, so the alarm→flee / food-found→approach correlation has no reason to
become learnable from the receiving end. Added a listener-side bonus: when a
Nodling hears a sound (`this.heardDir`, from the existing `s[22-24]` sense
inputs) while a predator is actually nearby (`this.predNear`, from the
existing `s[38-40]` predator sense), moving away from the sound source earns
`this.bonus += 0.15` — the same reward-shaping mechanism the caller side
already uses, just applied to the other half of the signal.

- Before (baseline, day 51.7, batch_ticks=80000): population 250, fitness
  4473, maxGen 80, avgBrain 68.4, built 677.
- After (validation, day 61.7, validation_ticks=16000): population 250,
  fitness 4686, maxGen 31, avgBrain 62.2, built 352.
- Guardrails: pass (no population crash, no NaN, fitness improved rather
  than dropped).
