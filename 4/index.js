// @ts-check
const common = require('../common.js');

/**
 * Check if a possible password is valid
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  let last = '';
  let foundDouble = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === last) foundDouble = true;
    if (s[i] < last) return false;
    last = s[i];
  }
  if (!foundDouble) return false;
  return true;
}

/**
 * Check if a possible password is valid part 2
 * @param {string} s
 * @return {boolean}
 */
function isValid2(s) {
  let last = '';
  let multiples = s.match(/(\d)\1+/g);
  if (!multiples) return false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] < last) return false;
    last = s[i];
  }
  return multiples.map(a => a.length).includes(2);
}

common.wrapMain([
  // preprocess
  input => input.split('-').map(Number),
  // 1
  input => {
    let found = 0;
    for (let i = input[0]; i <= input[1]; i++) {
      if (isValid(i.toString())) found++;
    }
    return found;
  },
  // 2
  input => {
    let found = 0;
    for (let i = input[0]; i <= input[1]; i++) {
      if (isValid2(i.toString())) found++;
    }
    return found;
  }
]);
