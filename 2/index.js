// @ts-check
const common = require('../common.js');
const debug = require('debug')('aoc:2');

/**
 * @param {number[]} opcodes
 * @param {number} ip
 * @return {any[]}
 */
function processInstruction(opcodes, ip) {
  switch (opcodes[ip]) {
    case 1: {
      opcodes[opcodes[ip + 3]] =
        opcodes[opcodes[ip + 1]] + opcodes[opcodes[ip + 2]];
      return [true, ip + 4];
    }
    case 2: {
      opcodes[opcodes[ip + 3]] =
        opcodes[opcodes[ip + 1]] * opcodes[opcodes[ip + 2]];
      return [true, ip + 4];
    }
    case 99: {
      return [false, ip + 1];
    }
  }
  throw new Error('Invalid opcode!');
}
/**
 * @param {number[]} opcodes
 * @return {number[]}
 */
function runIntcode(opcodes) {
  // instruction pointer
  let ip = 0;
  let run = true;
  while (run) {
    [run, ip] = processInstruction(opcodes, ip);
  }
  return opcodes;
}

common.wrapMain([
  // preprocess
  input => input.split(',').map(Number),
  // 1
  input => {
    input[1] = 12;
    input[2] = 2;
    let out = runIntcode(input);
    return out[0];
  },
  // 2
  input => {
    let target = 19690720;
    for (let a = 0; a < 100; a++) {
      for (let b = 0; b < 100; b++) {
        let opcodes = input.slice();
        opcodes[1] = a;
        opcodes[2] = b;
        debug('run program with a = %d, b = %d', a, b);
        runIntcode(opcodes);
        debug('output: %d', opcodes[0]);
        if (opcodes[0] === target) return [a, b];
      }
    }
  }
]);
