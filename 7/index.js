// @ts-check
const common = require('../common.js');
const IntcodeProcessor = require('../intcode.js');

/**
 * Try a sequence
 * @param {number[]} program
 * @param {number[]} sequence
 * @return {Promise<number>}
 */
async function trySequence(program, sequence) {
  let prevOutput = 0;
  for (let setting of sequence) {
    let processor = new IntcodeProcessor(program, { input: [setting, prevOutput] });
    prevOutput = (await processor.runToEnd())[0];
  }
  return prevOutput;
}

/**
 * Try a sequence but there's infinitely more async generators and other hacks
 * I mean it's *technically* extensible
 * @param {number[]} program
 * @param {number[]} sequence
 * @return {Promise<number[][]>}
 */
async function trySequence2(program, sequence) {
  let notify = new Array(5).fill(null);
  let p0 = new IntcodeProcessor(program, {
    name: 'p0',
    async* getInput() {
      yield sequence[0];
      yield 0;
      while (true) {
        let deferred = notify[0] = new common.Deferred();
        yield await deferred.promise;
      }
    },
    onOutput(out) {
      notify[1].resolve(out);
    }
  });
  let p1 = new IntcodeProcessor(program, {
    name: 'p1',
    async* getInput() {
      yield sequence[1];
      while (true) {
        let deferred = notify[1] = new common.Deferred();
        yield await deferred.promise;
      }
    },
    onOutput(out) {
      notify[2].resolve(out);
    }
  });
  let p2 = new IntcodeProcessor(program, {
    name: 'p2',
    async* getInput() {
      yield sequence[2];
      while (true) {
        let deferred = notify[2] = new common.Deferred();
        yield await deferred.promise;
      }
    },
    onOutput(out) {
      notify[3].resolve(out);
    }
  });
  let p3 = new IntcodeProcessor(program, {
    name: 'p3',
    async* getInput() {
      yield sequence[3];
      while (true) {
        let deferred = notify[3] = new common.Deferred();
        yield await deferred.promise;
      }
    },
    onOutput(out) {
      notify[4].resolve(out);
    }
  });
  let p4 = new IntcodeProcessor(program, {
    name: 'p4',
    async* getInput() {
      yield sequence[4];
      while (true) {
        let deferred = notify[4] = new common.Deferred();
        yield await deferred.promise;
      }
    },
    onOutput(out) {
      if (notify[0]) notify[0].resolve(out);
    }
  });

  return await Promise.all([
    p0.runToEnd(),
    p1.runToEnd(),
    p2.runToEnd(),
    p3.runToEnd(),
    p4.runToEnd()
  ]);
}

/**
 * Find all permutations of array
 * @param {number[]} input
 * @return {number[][]}
 */
function permute(input) {
  if (input.length === 2) return [input, input.reverse()];
  let out = [];
  for (let pick of input) {
    let step = permute(input.filter(a => pick !== a)).map(r => [pick, ...r]);
    out.push(...step);
  }
  return out;
}

common.wrapMain([
  // preprocess
  input => input.split(',').map(Number),
  // 1
  async input => {
    let highest = 0;
    for (let p of permute([0, 1, 2, 3, 4])) {
      let result = await trySequence(input, p);
      if (result > highest) highest = result;
    }
    return highest;
  },
  // 2
  async input => {
    let highest = 0;
    for (let p of permute([5, 6, 7, 8, 9])) {
      let result = await trySequence2(input, p);
      let out = result[4].slice(-1)[0];
      if (out > highest) highest = out;
    }
    return highest;
  }
]);
