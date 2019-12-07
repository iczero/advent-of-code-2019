const debug = require('debug')('aoc:intcode');

/**
 * Get the i-th digit of a number n where ones place is digit 0
 * @param {number} n Number
 * @param {number} i Digit number
 * @return {number}
 */
function digit(n, i) {
  return n % (10 ** (i + 1)) / (10 ** i) | 0;
}

module.exports = class IntcodeProcessor {
  /**
   * The constructor
   * @param {number[]} opcodes
   * @param {object} opts
   * @param {number[]} [opts.input] Direct input
   * @param {() => AsyncGenerator<any, number, any>} [opts.getInput] Fancy input
   * @param {() => void} [opts.onOutput] Output hook
   * @param {string} [opts.name] Optional name for this instance
   */
  constructor(opcodes, opts) {
    this.memory = opcodes.slice();
    this.input = opts.input;
    this.onOutput = opts.onOutput;

    /** Async generator representing input */
    this.inputState = opts.getInput ? opts.getInput() : null;
    /** Current input position */
    this.inputPos = 0;

    /** Instruction pointer */
    this.ip = 0;
    /**
     * Output
     * @type {number[]}
     */
    this.output = [];

    this.debug = opts.name ? debug.extend(opts.name) : debug;
  }

  /**
   * @return {Promise<number>}
   */
  async getInput() {
    if (this.inputState) return (await this.inputState.next()).value;
    else if (this.input) return this.input[this.inputPos++];
  }

  putOutput(out) {
    this.output.push(out);
    if (this.onOutput) this.onOutput(out);
  }

  /**
   * Run the next instruction
   * @return {Promise<boolean>} Whether or not the program should keep running
   */
  async processInstruction() {
    let memory = this.memory;
    let opcode = memory[this.ip];
    this.debug('ip %d opcode %d', this.ip, opcode);

    /**
     * Read the ith parameter taking into account parameter mode
     * @param {number} i
     * @return {number}
     */
    let readParam = i => this.modalRead(this.ip + i, digit(opcode, i + 1));

    switch (opcode % 100) {
      case 1: { // add(a, b, resultPos)
        this.debug('instruction add');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 + v2;
        this.debug('operation %d + %d = %d', v1, v2, out);
        this.inWrite(this.ip + 3, out);
        this.ip += 4;
        return true;
      }
      case 2: { // multiply(a, b, resultPos)
        this.debug('instruction multiply');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 * v2;
        this.debug('operation %d * %d = %d', v1, v2, out);
        this.inWrite(this.ip + 3, out);
        this.ip += 4;
        return true;
      }
      case 3: { // getInput(resultPos)
        this.debug('instruction getInput');
        let input = await this.getInput();
        this.debug('read input value %d', input);
        this.inWrite(this.ip + 1, input);
        this.ip += 2;
        return true;
      }
      case 4: { // writeOutput(pos)
        this.debug('instruction writeOutput');
        let out = this.modalRead(this.ip + 1, 0);
        this.debug('write output value %d', out);
        this.putOutput(out);
        this.ip += 2;
        return true;
      }
      case 5: { // jumpIfTrue(test, target)
        this.debug('instruction jumpIfTrue');
        if (readParam(1)) {
          this.debug('condition is true');
          this.ip = readParam(2);
          this.debug('jump to %d', this.ip);
          return true;
        } else {
          this.debug('condition is false');
          this.ip += 3;
          return true;
        }
      }
      case 6: { // jumpIfFalse(test, target)
        this.debug('instruction jumpIfFalse');
        if (!readParam(1)) {
          this.debug('condition is false');
          this.ip = readParam(2);
          this.debug('jump to %d', this.ip);
          return true;
        } else {
          this.debug('condition is false');
          this.ip += 3;
          return true;
        }
      }
      case 7: { // lessThan(a, b, resultPos)
        this.debug('instruction lessThan');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 < v2;
        this.debug('operation %d < %d = %s', v1, v2, out);
        this.inWrite(this.ip + 3, out ? 1 : 0);
        this.ip += 4;
        return true;
      }
      case 8: { // equals(a, b, resultPos)
        this.debug('instruction equals');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 === v2;
        this.debug('operation %d === %d = %s', v1, v2, out);
        this.inWrite(this.ip + 3, out ? 1 : 0);
        this.ip += 4;
        return true;
      }
      case 99: { // halt()
        this.debug('instruction halt');
        this.ip++;
        return false;
      }
    }
    throw new Error('Invalid opcode! ' + opcode);
  }

  /**
   * Use modes to read parameter
   * @param {number} param Parameter position
   * @param {number} mode Either 0 (positional) or 1 (immediate)
   * @return {number}
   */
  modalRead(param, mode) {
    if (mode === 0) {
      let pos = this.memory[param];
      let value = this.memory[pos];
      this.debug('read indirect ptr %d pos %d value %d', param, pos, value);
      return value;
    } else if (mode === 1) {
      let value = this.memory[param];
      this.debug('read direct pos %d value %d', param, value);
      return value;
    } else throw new Error('unknown mode');
  }

  /**
   * Write to the position specified by opcodes[i]
   * @param {number} i index
   * @param {number} n what to write
   */
  inWrite(i, n) {
    let pos = this.memory[i];
    this.debug('write indirect ptr %d pos %d value %d', i, pos, n);
    this.memory[pos] = n;
  }

  async runToEnd() {
    let run = true;
    while (run) run = await this.processInstruction();
    return this.output;
  }
};
