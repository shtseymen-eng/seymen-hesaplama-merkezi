const assert = require('assert');
const L = require('../logic.js');

assert.strictEqual(L.totalDayNumber('2026-01-01','2026-01-01'),1);
assert.strictEqual(L.totalDayNumber('2026-01-01','2026-04-01'),91);
const c = L.fireCalculation({entryKg:100000,remaining90Kg:90000,totalDays:100,aPercent:0.4,bPercent:0.002});
assert.strictEqual(c.firstDays,90);
assert.strictEqual(c.extraDays,10);
assert.ok(Math.abs(c.firstLossKg-400)<1e-9);
assert.ok(c.extraLossKg>0);
const records=[
 {product:'X',correlationYear:2025,aRate:0.2,bRate:0.001},
 {product:'X',correlationYear:2026,aRate:0.4,bRate:0.002},
];
assert.strictEqual(L.pickCorrelation(records,'X',2026).aRate,0.4);
assert.strictEqual(L.pickCorrelation(records,'X',2025).aRate,0.2);
assert.strictEqual(L.pickCorrelation(records,'X',2024).aRate,0.4);
console.log('logic tests passed');
