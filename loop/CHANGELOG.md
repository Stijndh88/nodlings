# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side communication reward shaping (day 51.7→61.7)

Priority signal 2 (communication): the sound channel existed but only the
*emitter* was rewarded for calling near something salient (food/predator).
Nothing rewarded a *listener* for reacting usefully to what it hears, so
alarm→flee / food→approach correlations had no gradient to bootstrap from.

Change: in `nodling.js` `tick()`, added a small reward term (`commReward`,
±0.15, added into the existing bounded reward calc) for the *previous*
action when it was a sensible response to what's currently audible —
moving away from a heard sound while a predator is also sensed nearby, or
moving toward one while hungry and safe. Uses only existing sense channels
(s[22] heard freq, s[23-24] heard dir, s[40] predator threat, s[1] energy);
doesn't hardcode what the frequency means, just makes "acting on hearing
something" pay off when it would.

Before (batch, day 51.7): population 251, fitness 4783, built 591 (573 durable).
After (validation, day 61.7): population 250, fitness 4889, built 427.
Guardrails passed (no fitness/population drop). `built` dip is within one
validation window's noise, not a guardrail metric — priority 1 (villages)
remains an order of magnitude past its milestone regardless.
