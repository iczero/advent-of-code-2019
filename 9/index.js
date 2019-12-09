// @ts-check
const common = require('../common.js');
const IntcodeProcessor = require('../intcode.js');

common.wrapMain([
  // preprocess
  input => input.split(',').map(Number),
  // 1
  input => {
    let processor = new IntcodeProcessor(input, { input: [1] });
    return processor.runToEnd();
  },
  // 2
  input => {
    let processor = new IntcodeProcessor(input, { input: [2] });
    return processor.runToEnd();
  }
]);
