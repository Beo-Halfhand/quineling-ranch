// kwigbo's Plaza Run as a Quineling (QDL 1, SDK 1.0.0) — Vision for Halfhand, 2026-10-21.
// Rules (kwigbo, City chat 10-21 4:29 PM): clock starts on arrival beside kwigbo at Central Plaza 79,61; gather one each of
// fish, rooftop tomato, skybridge cable, static charge, ore; beat 4:07 (247 s) → win. The rules live in this creature's code;
// its fingerprint is the seal. Inputs = what the public City record shows: arrival second + one entry per gather.
import {Session, sourceOnly} from '../quinelings/packages/agent-sdk/dist/v1.js';
import fs from 'fs';
const sec = {kind: 'number', unit: 'second', integer: true, min: 0};
const cnt = {kind: 'number', unit: 'count', integer: true, min: 0};
const ITEMS = ['fish', 'rooftop_tomato', 'skybridge_cable', 'static_charge', 'ore'];
const gather = {kind: 'record', fields: {item: {kind: 'string', enum: ITEMS}, at: sec}};
const intent = {
  format: 'qdl-intent', version: 1, name: "kwigbo's Plaza Run",
  thought: {
    observations: [
      {id: 'obsStart', text: 'Second the runner arrived beside kwigbo at Central Plaza 79,61 (the clock starts).', input: 'start', path: [], basis: 'open'},
      {id: 'obsGathers', text: 'One entry per gathered item with the second it landed, from the public City record.', input: 'gathers', path: [], basis: 'open'}
    ],
    evidence: [], goals: [], decisions: [],
    plans: [{id: 'plan', text: 'All five different items, and the last one in before 247 seconds after arrival.', tasks: ['task']}],
    tasks: [{id: 'task', text: 'Judge one run of the Plaza challenge.', nodes: ['start', 'gathers', 'distinct', 'kinds', 'five', 'allFive', 'anyRow', 'latest', 'finish', 'elapsed', 'limit', 'inTime', 'no', 'won', 'verdict'], outputs: ['verdict']}]
  },
  inputs: [
    {id: 'start', name: 'start', type: sec},
    {id: 'gathers', name: 'gathers', type: {kind: 'array', element: gather, minLength: 1, maxLength: 20}}
  ],
  steps: [
    {id: 'distinct', op: 'dedupe', inputs: ['gathers'], params: {key: 'item'}},
    {id: 'kinds', op: 'length', inputs: ['distinct'], params: {}},
    {id: 'five', op: 'literal', inputs: [], params: {value: 5}, type: cnt},
    {id: 'allFive', op: 'compareValues', inputs: ['kinds', 'five'], params: {operator: 'gte'}},
    {id: 'anyRow', op: 'literal', inputs: [], params: {value: {}}, type: {kind: 'record', fields: {}}},
    {id: 'latest', op: 'select', inputs: ['gathers', 'anyRow'], params: {keys: [], order: [{path: 'at', descending: true}], default: {item: 'ore', at: 0}}},
    {id: 'finish', op: 'get', inputs: ['latest'], params: {path: 'value.at'}},
    {id: 'elapsed', op: 'arithmetic', inputs: ['finish', 'start'], params: {kind: 'sub'}},
    {id: 'limit', op: 'literal', inputs: [], params: {value: 247}, type: sec},
    {id: 'inTime', op: 'compareValues', inputs: ['elapsed', 'limit'], params: {operator: 'lt'}},
    {id: 'no', op: 'literal', inputs: [], params: {value: false}, type: {kind: 'boolean'}},
    {id: 'won', op: 'choose', inputs: ['allFive', 'inTime', 'no'], params: {}},
    {id: 'verdict', op: 'report', inputs: ['won', 'elapsed', 'kinds'], params: {labels: ['won', 'seconds', 'items']}}
  ],
  outputs: ['verdict']
};
const s = new Session(); const art = s.compile(intent);
console.log('creature id :', art.id);
console.log('quine check :', sourceOnly.verifyQuine(art.source).sourceHash === art.id ? 'source rebuilds itself exactly' : 'FAILED');
const g = (pairs) => pairs.map(([item, at]) => ({item, at}));
const runs = {
  'fast, all five     ': [1000, g([['ore',1050],['fish',1100],['rooftop_tomato',1150],['skybridge_cable',1190],['static_charge',1230]])],
  'all five, too slow ': [1000, g([['ore',1060],['fish',1120],['rooftop_tomato',1180],['skybridge_cable',1220],['static_charge',1250]])],
  'fast, two fish     ': [1000, g([['fish',1050],['fish',1100],['rooftop_tomato',1150],['skybridge_cable',1190],['static_charge',1230]])],
};
let i = 0;
for (const [label, [start, gathers]] of Object.entries(runs)) {
  const r = s.run({artifactId: art.id, requestId: 'run-' + i++, inputs: {start, gathers}}); const o = r.result.occurrences[0];
  console.log(label, '→', o.status === 'completed' ? JSON.stringify(o.outputs[0]) : 'refused: ' + o.diagnostic?.message);
}
if (process.argv[2] === '--export') { fs.writeFileSync('plaza-run-source.json', JSON.stringify(art.source, null, 2)); fs.writeFileSync('plaza-run-intent.json', JSON.stringify(intent, null, 2)); console.log('exported'); }
