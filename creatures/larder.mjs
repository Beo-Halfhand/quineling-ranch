// Halfhand's Larder — his food rule as a Quineling (QDL 1, SDK 1.0.0).
// Rule: keep 3 smoothies. When he's at the store, buy back up to 3. Never buy if already stocked.
import {Session, sourceOnly} from '../quinelings/packages/agent-sdk/dist/v1.js';

const smoothie = {kind: 'number', unit: 'smoothie', integer: true, min: 0};
const intent = {
  format: 'qdl-intent', version: 1, name: "Halfhand's Larder",
  thought: {
    observations: [
      {id: 'obsHeld', text: 'Smoothies Halfhand is carrying right now.', input: 'held', path: [], basis: 'open'},
      {id: 'obsTarget', text: 'How many he keeps on hand by design.', input: 'target', path: [], basis: 'open'}
    ],
    evidence: [], goals: [], decisions: [],
    plans: [{id: 'plan', text: 'Work out the shortfall against his stock rule; extra smoothies count as full stock, so he never buys a negative amount.', tasks: ['task']}],
    tasks: [{id: 'task', text: 'Decide how many smoothies to buy at the store.', nodes: ['held', 'target', 'counted', 'buy', 'low', 'restock'], outputs: ['restock']}]
  },
  inputs: [
    {id: 'held', name: 'held', type: smoothie},
    {id: 'target', name: 'target', type: smoothie}
  ],
  steps: [
    {id: 'counted', op: 'arithmetic', inputs: ['held', 'target'], params: {kind: 'min'}},
    {id: 'buy', op: 'arithmetic', inputs: ['target', 'counted'], params: {kind: 'sub'}},
    {id: 'low', op: 'compareValues', inputs: ['held', 'target'], params: {operator: 'lt'}},
    {id: 'restock', op: 'report', inputs: ['low', 'buy'], params: {labels: ['needsRestock', 'buy']}}
  ],
  outputs: ['restock']
};

const session = new Session();
const art = session.compile(intent);
console.log('creature id :', art.id.slice(0, 20) + '…');
console.log('quine check :', sourceOnly.verifyQuine(art.source).sourceHash === art.id ? 'source rebuilds itself exactly' : 'FAILED');
for (const [i, held] of [3, 2, 0, 5].entries()) {
  const r = session.run({artifactId: art.id, requestId: 'larder-' + i, inputs: {held, target: 3}});
  console.log(`held ${held} → ${r.result.status === 'completed' ? JSON.stringify(r.result.occurrences[0].outputs[0]) : 'refused: ' + JSON.stringify(r.result.diagnostic ?? r.result).slice(0, 160)}`);
}
const g = sourceOnly.encode(art.source);
const back = new Session().recover({colors: g.colors});
console.log('colour genome → source:', back.source === art.source ? 'exact match' : 'MISMATCH');
