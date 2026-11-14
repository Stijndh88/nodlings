// Brain math sanity check — shared by the browser (index.html) and the
// headless loop harness (loop/run-headless.js). Returns true if every
// assertion held; each failure is also logged via console.assert.
'use strict';

function selfTest(){
  let ok = true;
  const assert = (cond, msg) => { console.assert(cond, msg); if (!cond) ok = false; };

  const rng = makeRng(42);
  const s = Array.from({length:N_SENSES}, (_,i)=>Math.sin(i));
  const g = randomGenome(rng);
  const brain = new Brain(g);
  const o = brain.step(s, 0);
  assert(OUTPUTS.every(k=>Number.isFinite(o[k]) && Math.abs(o[k]) <= 1.0001),
    'network outputs finite and bounded');
  const g2 = mutateGenome(g, rng), g3 = crossoverGenome(g, g2, rng);
  assert(genomeSize(g2) > 0 && g3.body.length === N_BODY && g3.drive.length === N_DRIVES, 'variation produces valid genomes');
  // learning actually changes a synapse when the reward differs from what was expected
  const gp = randomGenome(rng);
  gp.conns.forEach(c => { c.pl = 1; c.w = 0.5; });
  const bp = new Brain(gp), before = bp.w[0];
  for (let i = 0; i < 20; i++) bp.step(s.map(()=>1), 1);
  assert(bp.w[0] !== before, 'reward-modulated learning updates weights');
  // and does nothing when the reward is exactly as expected
  const bq = new Brain(gp), b0 = bq.w[0];
  for (let i = 0; i < 20; i++) bq.step(s.map(()=>1), 0);
  assert(bq.w[0] === b0, 'no surprise, no learning');

  if (ok) console.log('Nodlings self-test passed (NEAT + learning)');
  return ok;
}
