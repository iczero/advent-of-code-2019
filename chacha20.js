// @ts-check
/* global BigInt */
const debug = require('debug')('chacha20');

/**
 * Read multiple longs from a buffer (little endian)
 * @param {Buffer} buf Input buffer
 * @param {number} count Number of values to read
 * @return {number[]} Array of values
 */
function readLong(buf, count) {
  let out = new Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = buf.readUInt32LE(i * 4);
  }
  return out;
}

/**
 * Create a new block
 * @param {Buffer} key 32-byte key
 * @param {Buffer} nonce 8-byte nonce
 * @param {number} [position=0] 8-byte stream position
 * @param {Buffer} [constant] Constant (default 'expand 32-byte k')
 * @return {number[]}
 */
function createState(
  key,
  nonce,
  position = 0,
  constant = Buffer.from('expand 32-byte k')
) {
  return [
    // constant
    ...readLong(constant, 4),
    // key
    ...readLong(key, 8),
    // stream position
    position,
    // nonce
    ...readLong(nonce, 3)
  ];
}

/**
 * Definition of the <<< operation
 * @param {number} n Input
 * @param {number} i Count
 * @return {number}
 */
function rotl(n, i) {
  return ((n << i) | (n >>> (32 - i))) >>> 0;
}

/**
 * Perform a chacha20 quarter round with given indices
 * @param {number[]} s State array
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 */
function quarterRound(s, a, b, c, d) {
  // uint32 hints
  s[a] = (s[a] + s[b]) >>> 0;
  s[d] = (s[d] ^ s[a]) >>> 0;
  s[d] = rotl(s[d], 16);

  s[c] = (s[c] + s[d]) >>> 0;
  s[b] = (s[b] ^ s[c]) >>> 0;
  s[b] = rotl(s[b], 12);

  s[a] = (s[a] + s[b]) >>> 0;
  s[d] = (s[d] ^ s[a]) >>> 0;
  s[d] = rotl(s[d], 8);

  s[c] = (s[c] + s[d]) >>> 0;
  s[b] = (s[b] ^ s[c]) >>> 0;
  s[b] = rotl(s[b], 7);
}

/**
 * Do a double round (odd + even)
 * @param {number[]} s State array
 */
function doubleRound(s) {
  // odd
  quarterRound(s, 0, 4, 8, 12);
  quarterRound(s, 1, 5, 9, 13);
  quarterRound(s, 2, 6, 10, 14);
  quarterRound(s, 3, 7, 11, 15);

  // even
  quarterRound(s, 0, 5, 10, 15);
  quarterRound(s, 1, 6, 11, 12);
  quarterRound(s, 2, 7, 8, 13);
  quarterRound(s, 3, 4, 9, 14);
}

/**
 * Do a block operation
 * @param {number[]} state
 * @return {number[]} New state
 */
function doBlock(state) {
  let x = state.slice();
  for (let i = 0; i < 10; i++) doubleRound(x);
  for (let i = 0; i < 16; i++) x[i] = (x[i] + state[i]) >>> 0;
  return x;
}

/**
 * Get a keystream
 * @param {Buffer} key 32-byte key
 * @param {Buffer} nonce 8-byte nonce
 * @param {number} [position=0] Initial stream position (8 bytes)
 * @param {Buffer} [constant] Constant (default 'expand 32-byte k')
 */
function* keystream(
  key,
  nonce,
  position = 0,
  constant = Buffer.from('expand 32-byte k')
) {
  while (true) {
    // max position count
    if (position >= 2 ** 32) return;
    let state = createState(key, nonce, position++, constant);
    debug('created new state: position = %d, state = %O', position, state.map(a => a.toString(16)));
    let out = doBlock(state);
    debug('state after block operation: %O', out.map(a => a.toString(16)));
    for (let i = 0; i < 16; i++) {
      yield out[i] & 0xff;
      yield out[i] >> 8 & 0xff;
      yield out[i] >> 16 & 0xff;
      yield out[i] >> 24 & 0xff;
    }
  }
}

exports.createState = createState;
exports.doBlock = doBlock;
exports.keystream = keystream;
