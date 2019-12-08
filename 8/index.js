// @ts-check
const common = require('../common.js');

const LENGTH = 25;
const WIDTH = 6;
const LAYER_SIZE = LENGTH * WIDTH;

common.wrapMain([
  /**
   * preprocess: select layers (25 * 6 = 150)
   * @type {(input: string) => string[]}
   */
  input => {
    let out = input.match(new RegExp(`.{${LAYER_SIZE}}`, 'g'));
    if (!out) throw new Error('typescript are you happy now');
    return out;
  },
  /**
   * 1
   * @type {(input: string[]) => number}
   */
  input => {
    let min = Infinity;
    let minLayer = input[0];
    for (let layer of input) {
      let zeroes = (layer.match(/0/g) || []).length;
      if (zeroes < min) {
        min = zeroes;
        minLayer = layer;
      }
    }
    return (minLayer.match(/1/g) || []).length *
      (minLayer.match(/2/g) || []).length;
  },
  /**
   * 2
   * @type {(input: string[]) => string}
   */
  input => {
    /** @type {string[]} */
    let final = new Array(LAYER_SIZE).fill('2');
    for (let i = 0; i < LAYER_SIZE; i++) {
      let px = '2';
      let layerIndex = 0;
      while (px === '2') px = input[layerIndex++][i];
      final[i] = px;
    }
    let out = final
      .map(a => {
        switch (a) {
          case '0': return '█';
          case '1': return ' ';
          case '2': return '?';
        }
      }).join('');
    let lines = out.match(new RegExp(`.{${LENGTH}}`, 'g'));
    // there is no lines?
    if (!lines) throw new Error('???');
    return lines.join('\n');
  }
]);
