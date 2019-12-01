// @ts-check
const fs = require('fs');
const fsP = fs.promises;

module.exports = {
  /**
   * Utility wrapper for things
   * @param {Function[]} parts Processors for parts
   * @return {Promise<void>}
   */
  async wrapMain(parts) {
    // usage: node thing.js <part>
    let part = +process.argv[2];
    if (!part) return console.error('No part number provided');
    let input = (await fsP.readFile('input.txt')).toString();
    // input preprocessing function
    if (parts[0]) input = (await parts[0](input));
    // run actual processing
    if (!parts[part]) return console.error('No such part');
    console.log(await parts[part](input));
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

