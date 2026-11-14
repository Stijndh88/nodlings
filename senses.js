// The sense table: what a Nodling's brain receives, by index. APPEND ONLY: the
// number of senses is part of the genome format (see loop/PLAYBOOK.md section 8).
// Nodlings sense PROPERTIES of things (hard, fuel, smell, look...), never material
// names, so any material added later is perceived at once.
// The values are filled in by Nodling.sense() in nodling.js.
'use strict';

const SENSE_NAMES = [
  'bias',                                             // 0 always 1
  'energy', 'hydration', 'bodyTemp', 'pain', 'age', 'cold', 'heldMass',            // 1-7 body
  'handHard', 'handFuel', 'handSmell', 'handLook', 'handSharp',                     // 8-12 item in hand
  'aheadHard', 'aheadFuel', 'aheadSmell', 'aheadLook', 'aheadHeat', 'aheadHeight', 'aheadWater', // 13-19 cell ahead
  'underHard', 'underFuel', 'underSmell', 'underLook', 'underHeat', 'underHeight',  // 20-25 cell underfoot
  'waterX', 'waterY', 'heatX', 'heatY',                                             // 26-29 directions to the nearest...
  'plantAX', 'plantAY', 'plantBX', 'plantBY',                                       // 30-33 plant with look +1 / look -1
  'fleshX', 'fleshY', 'hardX', 'hardY', 'fuelX', 'fuelY', 'wallX', 'wallY',         // 34-41
  'animalX', 'animalY', 'nodlingX', 'nodlingY', 'predatorX', 'predatorY',           // 42-47
  'threat',                                                                         // 48 predator closeness
  'otherMoveX', 'otherMoveY', 'otherAct', 'otherGain', 'otherAdult', 'kinship',     // 49-54 nearest Nodling
  'otherHoldsFood', 'otherHoldsHard',                                               // 55-56
  'heardPitch', 'heardX', 'heardY',                                                 // 57-59 sound
  'mem0', 'mem1', 'mem2', 'mem3',                                                   // 60-63 own memory outputs, fed back
  'noise', 'facingX', 'facingY', 'daylight', 'season', 'shelter',                   // 64-69
  'knownWaterX', 'knownWaterY', 'knownFoodX', 'knownFoodY',                         // 70-73 where it last drank / ate well
];
const N_SENSES = SENSE_NAMES.length;
const S = {};                                 // S.energy === 1, ...
SENSE_NAMES.forEach((n, i) => { S[n] = i; });

// Groups used by the switched-off tests in metrics.js
const MEMORY_SENSES = [S.mem0, S.mem1, S.mem2, S.mem3, S.knownWaterX, S.knownWaterY, S.knownFoodX, S.knownFoodY];
const SOCIAL_SENSES = [S.nodlingX, S.nodlingY, S.otherMoveX, S.otherMoveY, S.otherAct, S.otherGain, S.otherAdult,
                       S.kinship, S.otherHoldsFood, S.otherHoldsHard];
const HEARING_SENSES = [S.heardPitch, S.heardX, S.heardY];
