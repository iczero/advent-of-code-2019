// @ts-check
const common = require('../common.js');
const debug = require('debug')('aoc:2');

/**
 * Get the i-th digit of a number n where ones place is digit 0
 * @param {number} n Number
 * @param {number} i Digit number
 * @return {number}
 */
function digit(n, i) {
  return n % (10 ** (i + 1)) / (10 ** i) | 0;
}

class IntcodeProcessor {
  /**
   * The constructor
   * @param {number[]} opcodes
   * @param {number[]} input
   */
  constructor(opcodes, input) {
    this.memory = opcodes;
    this.input = input;
    /** Current input position */
    this.inputPos = 0;

    /** Instruction pointer */
    this.ip = 0;
    /**
     * Output
     * @type {number[]}
     */
    this.output = [];
  }

  /**
   * Run the next instruction
   * @return {boolean} Whether or not the program should keep running
   */
  processInstruction() {
    let memory = this.memory;
    let opcode = memory[this.ip];

    /**
     * Get memory position and parameter mode for argument
     * @param {number} i Argument number
     * @return {[number, number]} [index, mode]
     */
    let param = i => {
      return [this.ip + i, digit(opcode, i + 1)];
    };

    switch (opcode % 100) {
      case 1: { // add(a, b, resultPos)
        this.inWrite(this.ip + 3, this.modalRead(...param(1)) +
          this.modalRead(...param(2)));
        this.ip += 4;
        return true;
      }
      case 2: { // multiply(a, b, resultPos)
        this.inWrite(this.ip + 3, this.modalRead(...param(1)) *
          this.modalRead(...param(2)));
        this.ip += 4;
        return true;
      }
      case 3: { // getInput(resultPos)
        this.inWrite(this.ip + 1, this.input[this.inputPos++]);
        this.ip += 2;
        return true;
      }
      case 4: { // writeOutput(pos)
        this.output.push(memory[memory[this.ip + 1]]);
        this.ip += 2;
        return true;
      }
      case 5: { // jumpIfTrue(test, target)
        if (this.modalRead(...param(1))) {
          this.ip = this.modalRead(...param(2));
          return true;
        } else {
          this.ip += 3;
          return true;
        }
      }
      case 6: { // jumpIfFalse(test, target)
        if (!this.modalRead(...param(1))) {
          this.ip = this.modalRead(...param(2));
          return true;
        } else {
          this.ip += 3;
          return true;
        }
      }
      case 7: { // lessThan(a, b, resultPos)
        let out = this.modalRead(...param(1)) < this.modalRead(...param(2)) ? 1 : 0;
        this.inWrite(this.ip + 3, out);
        this.ip += 4;
        return true;
      }
      case 8: { // equals(a, b, resultPos)
        let out = this.modalRead(...param(1)) === this.modalRead(...param(2)) ? 1 : 0;
        this.inWrite(this.ip + 3, out);
        this.ip += 4;
        return true;
      }
      case 99: { // halt()
        this.ip++;
        return false;
      }
    }
    throw new Error('Invalid opcode!');
  }

  /**
   * Use modes to read parameter
   * @param {number} param Parameter position
   * @param {number} mode Either 0 (positional) or 1 (immediate)
   * @return {number}
   */
  modalRead(param, mode) {
    if (mode === 0) return this.memory[this.memory[param]];
    else if (mode === 1) return this.memory[param];
    else throw new Error('unknown mode');
  }

  /**
   * Write to the position specified by opocodes[i]
   * @param {number} i index
   * @param {number} n what to write
   */
  inWrite(i, n) {
    this.memory[this.memory[i]] = n;
  }

  runToEnd() {
    let run = true;
    while (run) run = this.processInstruction();
    return this.output;
  }
}

common.wrapMain([
  // preprocess
  input => input.split(',').map(Number),
  // 1
  input => {
    let processor = new IntcodeProcessor(input, [1]);
    return processor.runToEnd();
  },
  // 2
  input => {
    let processor = new IntcodeProcessor(input, [5]);
    return processor.runToEnd();
  }
]);
