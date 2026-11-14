// The simulation files, in load order. One list for the runner, the A/B tooling,
// the experiments and the tests. metrics.js (the exam) is last and is always taken
// from the current checkout, so both arms of an A/B sit the same exam.
'use strict';
const SIM_FILES = ['materials.js', 'senses.js', 'brain.js', 'world.js', 'physics.js', 'selftest.js', 'actions.js',
  'nodling.js', 'critters.js', 'predators.js', 'observer.js', 'sim.js', 'metrics.js'];
module.exports = { SIM_FILES, PATCHABLE: SIM_FILES.filter(f => f !== 'metrics.js') };
