// @ts-check
const common = require('../common.js');

/**
 * @param {number} mass
 * @return {number}
 */
function doFuelCalculation(mass) {
  return (+mass / 3 | 0) - 2;
}

common.wrapMain([
  // preprocess
  input => common.splitInput(input).map(a => +a),
  // 1
  input => input
    .map(doFuelCalculation)
    .reduce((acc, val) => acc + val),
  // 2
  input => input
    .map(value => {
      let acc = 0;
      let current = doFuelCalculation(value);
      while (current > 0) {
        acc += current;
        current = doFuelCalculation(current);
      }
      return acc;
    })
    .reduce((acc, val) => acc + val)
]);
