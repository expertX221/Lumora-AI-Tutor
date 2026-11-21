import {test} from 'node:test';
import assert from 'node:assert/strict';
import {physics} from './physics.js';
test('frictionless experiment follows F = ma and constant-acceleration kinematics',()=>{assert.deepEqual(physics(6,3,3),{acceleration:2,velocity:6,distance:9});});
test('doubling mass halves acceleration at fixed force',()=>{assert.equal(physics(8,4,2).acceleration,physics(8,2,2).acceleration/2);});
test('zero net force causes no acceleration from rest',()=>{assert.deepEqual(physics(0,3,3),{acceleration:0,velocity:0,distance:0});});
test('control extremes stay within the 8-unit visual track',()=>{for(let f=0;f<=16;f++)for(let m=1;m<=8;m++){const p=physics(f,m,3);assert(p.distance*.1<=8);}});
test('invalid physical inputs are rejected',()=>{assert.throws(()=>physics(6,0,3),RangeError);assert.throws(()=>physics(6,3,-1),RangeError);});
