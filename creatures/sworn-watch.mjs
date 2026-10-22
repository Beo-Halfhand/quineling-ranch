// Sworn Watch — a sworn-contract stand check as a Quineling (QDL 1, SDK 1.0.0).
// Terms live IN the source: stand on central (61,65); 5 hidden checks must all find you there.
// The creature's fingerprint commits to those terms. Anyone can rerun it on the same readings
// and must get the same verdict.
import {Session, sourceOnly} from '../quinelings/packages/agent-sdk/dist/v1.js';
import fs from 'fs';

const tile = {kind: 'number', unit: 'tile', integer: true, min: 0};
const reading = {kind: 'record', fields: {x: tile, y: tile}};
const check = {kind: 'number', unit: 'count', integer: true, min: 0};

const intent = {
  format: 'qdl-intent', version: 1, name: 'Sworn Watch',
  thought: {
    observations: [
      {id: 'obsReadings', text: 'Where the taker stood at each hidden check, read from the public City API.', input: 'readings', path: [], basis: 'open'}
    ],
    evidence: [], goals: [], decisions: [],
    plans: [{id: 'plan', text: 'Count the checks that found the taker on the sworn tile and compare against the sworn number.', tasks: ['task']}],
    tasks: [{id: 'task', text: 'Decide whether the stand contract was met.', nodes: ['readings', 'onTile', 'hits', 'checks', 'required', 'met', 'verdict'], outputs: ['verdict']}]
  },
  inputs: [
    {id: 'readings', name: 'readings', type: {kind: 'array', element: reading, minLength: 1, maxLength: 64}}
  ],
  steps: [
    {id: 'onTile', op: 'filter', inputs: ['readings'], params: {operator: 'eq', value: {x: 61, y: 65}}},
    {id: 'hits', op: 'length', inputs: ['onTile'], params: {}},
    {id: 'checks', op: 'length', inputs: ['readings'], params: {}},
    {id: 'required', op: 'literal', inputs: [], params: {value: 5}, type: check},
    {id: 'met', op: 'compareValues', inputs: ['hits', 'required'], params: {operator: 'gte'}},
    {id: 'verdict', op: 'report', inputs: ['met', 'hits', 'checks'], params: {labels: ['met', 'onTile', 'checks']}}
  ],
  outputs: ['verdict']
};

const session = new Session();
const art = session.compile(intent);
console.log('creature id :', art.id.slice(0, 20) + '…');
console.log('quine check :', sourceOnly.verifyQuine(art.source).sourceHash === art.id ? 'source rebuilds itself exactly' : 'FAILED');
const runs = {
  'held all 5     ': [[61,65],[61,65],[61,65],[61,65],[61,65]],
  'nudged once    ': [[61,65],[61,65],[60,65],[61,65],[61,65]],
  'never showed up': [[19,56],[20,56],[22,56],[24,56],[26,56]]
};
let i = 0;
for (const [label, pts] of Object.entries(runs)) {
  const r = session.run({artifactId: art.id, requestId: 'watch-' + i++, inputs: {readings: pts.map(([x, y]) => ({x, y}))}});
  const o = r.result.occurrences[0];
  console.log(`${label} → ${o.status === 'completed' ? JSON.stringify(o.outputs[0]) : 'refused: ' + o.diagnostic?.message}`);
}
if (process.argv[2] === '--export') {
  fs.writeFileSync('sworn-watch-source.json', JSON.stringify(art.source, null, 2));
  fs.writeFileSync('sworn-watch-intent.json', JSON.stringify(intent, null, 2));
  console.log('wrote sworn-watch-source.json + sworn-watch-intent.json');
}
