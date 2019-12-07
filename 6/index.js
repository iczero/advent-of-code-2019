// @ts-check
const common = require('../common.js');
const debug = require('debug')('aoc:6');

/**
 * Count direct and indirect orbits for each object
 * @param {Map<string, string>} orbits
 * @return {Map<string, number>} How many object each object indirectly and directly orbits
 */
function findOrbitCounts(orbits) {
  /** @type {Map<string, number>} */
  let counts = new Map();
  /** @type {(object: string) => number} */
  let countOrbits = object => {
    debug('find orbit count for %s', object);
    let count = counts.get(object);
    if (count !== undefined) {
      debug('count already found: %d', count);
      return count;
    }
    let orbited = orbits.get(object);
    if (!orbited) {
      debug('object does not orbit anything');
      count = 0;
    } else count = countOrbits(orbited) + 1;
    counts.set(object, count);
    debug('total orbits for object %s: %d', object, count);
    return count;
  };
  for (let satellite of orbits.keys()) countOrbits(satellite);
  return counts;
}

common.wrapMain([
  /**
   * preprocess
   * output: [object, satellite][]
   * @type {(input: string) => Map<string, string>}
   */
  input => new Map(input.split('\n')
    .map(a => /** @type {[string, string]} */ (a.split(')').reverse()))),
  /**
   * 1
   * @type {(input: Map<string, string>) => number}
   */
  input => {
    return [...findOrbitCounts(input).values()].reduce((acc, val) => acc + val);
  },
  /**
   * 2
   * @type {(input: Map<string, string>) => number}
   */
  input => {
    let findPath = object => {
      let path = [];
      let next = input.get(object);
      while (next) {
        object = next;
        path.push(next);
        next = input.get(object);
      }
      return path;
    };

    let pathA = findPath('YOU');
    let pathB = findPath('SAN');
    for (let [i, object1] of pathA.entries()) {
      for (let [j, object2] of pathB.entries()) {
        if (object1 === object2) return i + j;
      }
    }
    throw new Error('no path found');
  },
  /**
   * not actually part 3 but it dumps to graphviz because yay
   * use node index.js 3 | dot -Tsvg -Gsplines=spline -Goverlap=scale > graph.svg
   * and be horrified as to how far away santa actually is
   * (alternatively you could cheat and use node index.js 3 | dijkstra YOU and
   * then subtract 2 from the result you get for the SAN node)
   * @type {(input: Map<string, string>) => string}
   */
  input => {
    let objects = new Set();
    /** @type {string[]} */
    let edges = [];
    let output = 'digraph {\n';
    for (let [satellite, object] of input) {
      objects.add(object);
      objects.add(satellite);
      edges.push(`  "${object}" -> "${satellite}"`);
    }
    output += [...objects].map(object => {
      let color = 'black';
      switch (object) {
        case 'SAN':
          color = 'red';
          break;
        case 'YOU':
          color = 'green';
          break;
        case 'COM':
          color = 'blue';
          break;
      }

      return `  "${object}" [label = "${object}", color = "${color}"]`;
    }).join('\n');
    output += edges.join('\n');
    output += '\n}';
    return output;
  }
]);
