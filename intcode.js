// @ts-check
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
   * @param {(out: number) => void} [opts.onOutput] Output hook
   * @param {string} [opts.name] Optional name for this instance
   */
  constructor(opcodes, opts) {
    this.memory = opcodes.slice();
    this.input = opts.input;
    this.onOutput = opts.onOutput;

    /** Async generator representing input */
    this.inputState = opts.getInput
      ? opts.getInput()
      : opts.input
        ? opts.input.values()
        : null;
    /** Current input position */
    this.inputPos = 0;

    /** Should we be running? */
    this.run = false;
    /** Instruction pointer */
    this.ip = 0;
    /** @type {number} */
    this.relativeBase = 0;
    /**
     * Output
     * @type {number[]}
     */
    this.output = [];

    this.debug = opts.name ? debug.extend(opts.name) : debug;
  }

  /**
   * Get next input value
   * @return {Promise<number>}
   */
  async getInput() {
    if (!this.inputState) throw new Error('no input provided');
    let state = await this.inputState.next();
    if (state.done) throw new Error('no more input!');
    return state.value;
  }

  /**
   * Write output
   * @param {number} out
   */
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
    let writeParam = (i, val) => this.modalWrite(this.ip + i, digit(opcode, i + 1), val);

    switch (opcode % 100) {
      case 1: { // add(a, b, resultPos)
        this.debug('instruction add');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 + v2;
        this.debug('operation %d + %d = %d', v1, v2, out);
        writeParam(3, out);
        this.ip += 4;
        return true;
      }
      case 2: { // multiply(a, b, resultPos)
        this.debug('instruction multiply');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 * v2;
        this.debug('operation %d * %d = %d', v1, v2, out);
        writeParam(3, out);
        this.ip += 4;
        return true;
      }
      case 3: { // getInput(resultPos)
        this.debug('instruction getInput');
        let input = await this.getInput();
        this.debug('read input value %d', input);
        writeParam(1, input);
        this.ip += 2;
        return true;
      }
      case 4: { // writeOutput(pos)
        this.debug('instruction writeOutput');
        let out = readParam(1);
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
        writeParam(3, out ? 1 : 0);
        this.ip += 4;
        return true;
      }
      case 8: { // equals(a, b, resultPos)
        this.debug('instruction equals');
        let v1 = readParam(1);
        let v2 = readParam(2);
        let out = v1 === v2;
        this.debug('operation %d === %d = %s', v1, v2, out);
        writeParam(3, out ? 1 : 0);
        this.ip += 4;
        return true;
      }
      case 9: { // setRelativeBase(offset)
        this.debug('instruction setRelativeBase');
        let offset = readParam(1);
        let value = this.relativeBase + offset;
        this.debug('relative base original %d offset %d new %d',
          this.relativeBase, offset, value);
        this.relativeBase = value;
        this.ip += 2;
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
      let pos = this.read(param);
      let value = this.read(pos);
      this.debug('read indirect ptr %d pos %d value %d', param, pos, value);
      return value;
    } else if (mode === 1) {
      let value = this.read(param);
      this.debug('read direct pos %d value %d', param, value);
      return value;
    } else if (mode === 2) {
      let pos = this.read(param) + this.relativeBase;
      let value = this.read(pos);
      this.debug('read indirect relative ptr %d base %d pos %d value %d',
        param, this.relativeBase, pos, value);
      return value;
    } else throw new Error('unknown mode');
  }

  /**
   * Protected read
   * Returns 0 if position is undefined (sparse), throws if negative
   * @param {number} pos
   * @return {number}
   */
  read(pos) {
    if (pos < 0) throw new Error('invalid memory read: negative position');
    let read = this.memory[pos];
    if (typeof read === 'undefined') {
      this.debug('memory read sparse pos %d', pos);
      return 0;
    }
    return read;
  }

  /**
   * Modal write
   * @param {number} i index
   * @param {number} mode mode
   * @param {number} n what to write
   */
  modalWrite(i, mode, n) {
    if (mode === 0) {
      let pos = this.read(i);
      this.debug('write indirect ptr %d pos %d value %d', i, pos, n);
      this.memory[pos] = n;
    } else if (mode === 1) {
      throw new Error('invalid write mode 1');
    } else if (mode === 2) {
      let pos = this.read(i);
      let target = pos += this.relativeBase;
      this.debug('write indirect relative ptr %d base %d pos %d value %d',
        i, this.relativeBase, target, n);
      this.memory[pos] = n;
    } else throw new Error('invalid write mode ' + mode);
  }

  async runToEnd() {
    this.run = true;
    while (this.run) this.run = await this.processInstruction();
    return this.output;
  }
};
