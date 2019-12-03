// @ts-check
const common = require('../common.js');

// DISCLAIMER: THIS SOLUTION IS PRETTY BAD
// This solution plots out every point that each line crosses.
// A better solution (credit iovoid) would check intersections between every
// pair of lines instead of plotting all the points themselves.

common.hookYargs(yargs => {
  yargs
    .boolean('constant-time')
    .describe('constant-time', 'Use the constant time (almost) intersection implementation')
    .default('constant-time', true)
    .boolean('polynomial-time')
    .describe('polynomial-time', 'Use the polynomial time intersection implementation (slow)');
});

/**
 * Plot every point on the path
 * Origin is 0, 0
 * @param {string[]} input
 * @return {number[][]}
 */
function processPath(input) {
  /** @type {number[][]} */ // format: [x, y]
  let points = [];
  let pos = [0, 0];
  let steps = 0;
  for (let instruction of input) {
    let direction = [0, 0];
    switch (instruction[0]) {
      case 'R':
        direction = [1, 0];
        break;
      case 'L':
        direction = [-1, 0];
        break;
      case 'U':
        direction = [0, 1];
        break;
      case 'D':
        direction = [0, -1];
        break;
      default:
        throw new Error('invalid direction');
    }
    for (let i = 0; i < +instruction.slice(1); i++) {
      [pos[0], pos[1]] = [pos[0] + direction[0], pos[1] + direction[1]];
      points.push([...pos, ++steps]);
    }
  }
  return points;
}

/**
 * Find intersections using a lot of hacks
 * @param {string[][]} input
 * @return {number[][]}
 */
function findIntersectionsPolynomialTime(input) {
  let pathA = processPath(input[0]);
  let pathAPoints = pathA.map(a => a.slice(0, 2).join(','));
  let pathB = processPath(input[1]);
  let pathBPoints = pathB.map(a => a.slice(0, 2).join(','));
  /** @type {number[][]} */
  let intersections = [];
  for (let i = 0; i < pathB.length; i++) {
    let j = pathAPoints.indexOf(pathBPoints[i]);
    if (j > -1) intersections.push([...pathA[j], pathB[i][2]]);
  }
  return intersections;
}

/**
 * Shove a path into a Map
 * @param {number[][]} path
 * @return {Map<string, number>} Map with key 'x,y' and value of path index
 */
function dumpPathToMap(path) {
  /** @type {Map<string, number>} */
  let out = new Map();
  for (let i = 0; i < path.length; i++) {
    let point = path[i];
    let key = point.slice(0, 2).join(',');
    if (out.has(key)) continue;
    out.set(key, i);
  }
  return out;
}

/**
 * Find intersections using even more hacks but it's faster!
 * @param {string[][]} input
 * @return {number[][]}
 */
function findIntersectionsConstantTime(input) {
  let pathA = processPath(input[0]);
  let pathAMap = dumpPathToMap(pathA);
  let pathB = processPath(input[1]);
  let pathBMap = dumpPathToMap(pathB);
  /** @type {number[][]} */
  let intersections = [];
  for (let [key, i] of pathBMap.entries()) {
    let j = pathAMap.get(key);
    if (j) intersections.push([...pathA[j], pathB[i][2]]);
  }
  return intersections;
}

if (common.argv['polynomial-time']) common.argv['constant-time'] = false;
let findIntersections;
if (common.argv['constant-time']) {
  findIntersections = findIntersectionsConstantTime;
} else if (common.argv['polynomial-time']) {
  findIntersections = findIntersectionsPolynomialTime;
} else {
  console.error('No intersection implementation selected');
  process.exit(-1);
}

/**
 * Find minimum value in array
 * @param {number[]} array
 * @return {number[]} [value, index]
 */
function findMinimum(array) {
  let value = Infinity;
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i] < value) {
      value = array[i];
      index = i;
    }
  }
  return [value, index];
}

common.wrapMain([
  // preprocess
  input => input.split('\n').filter(a => a).map(a => a.split(',')),
  // 1
  input => {
    let intersections = findIntersections(input);
    let distances = intersections.map(a => Math.abs(a[0]) + Math.abs(a[1]));
    let [minimum, index] = findMinimum(distances);
    return [minimum, intersections[index]];
  },
  // 2
  input => {
    let intersections = findIntersections(input);
    let distances = intersections.map(a => a[2] + a[3]);
    let [minimum, index] = findMinimum(distances);
    return [minimum, intersections[index]];
  }
]);
