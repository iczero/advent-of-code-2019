// @ts-check
const fs = require('fs');
const fsP = fs.promises;
/** @typedef {import('yargs')} Yargs */

/** @type {(yargs: Yargs) => void} */
let yargsHook = yargs => {};

module.exports = {
  // types on argv is going to be a nightmare
  /** @type {any} */
  argv: null,
  /**
   * Hook for the argument parser to register additional options
   * @param {typeof yargsHook} fn
   */
  hookYargs(fn) {
    yargsHook = fn;
    this.parseArgs();
  },
  /**
   * Parse arguments
   * @return {any}
   */
  parseArgs() {
    return this.argv = require('yargs')
      .command('$0 <part>', 'run a solution', yargs => {
        yargs.positional('part', {
          describe: 'Which part to run',
          type: 'number',
          default: 1
        });
        yargsHook(yargs);
      })
      .argv;
  },
  /**
   * Utility wrapper for things
   * @param {Function[]} parts Processors for parts
   * @return {Promise<void>}
   */
  async wrapMain(parts) {
    // feature creep yes
    if (!this.argv) this.parseArgs();
    let part = this.argv.part;
    if (!part) return console.error('No part number provided');
    let input = (await fsP.readFile('input.txt')).toString();
    // input preprocessing function
    if (parts[0]) input = (await parts[0](input));
    // run actual processing
    if (!parts[part]) return console.error('No such part');
    let result = await parts[part](input);
    if (typeof result !== 'string' && result[Symbol.iterator]) console.log(...result);
    else console.log(result);
  },

  /**
   * Split input and remove empty entries
   * @param {string} input
   * @return {string[]}
   */
  splitInput(input) {
    return input.split('\n').filter(a => a);
  }
};

