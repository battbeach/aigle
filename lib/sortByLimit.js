'use strict';

const { Aigle } = require('./aigle');
const { DEFAULT_LIMIT, AigleLimitArray, AigleLimitObject } = require('./internal/aigleLimit');
const { sort } = require('./internal/util');

class SortByLimitArray extends AigleLimitArray {

  constructor(object, iterator, limit) {
    super(object, iterator, limit);
    this._result = Array(this._rest);
  }

  _callResolve(criteria, index) {
    if (this._promise._resolved !== 0) {
      return;
    }
    this._result[index] = { criteria, value: this._array[index] };
    if (--this._rest === 0) {
      this._promise._resolve(sort(this._result));
    } else if (this._index < this._size) {
      this._next();
    }
  }
}
class SortByLimitObject extends AigleLimitObject {

  constructor(object, iterator, limit) {
    super(object, iterator, limit);
    this._result = Array(this._rest);
  }

  _callResolve(criteria, index) {
    if (this._promise._resolved !== 0) {
      return;
    }
    this._result[index] = { criteria, value: this._object[this._keys[index]] };
    if (--this._rest === 0) {
      this._promise._resolve(sort(this._result));
    } else if (this._index < this._size) {
      this._next();
    }
  }
}

module.exports = sortByLimit;

/**
 * @param {Array|Object} collection
 * @param {integer} [limit=8]
 * @param {Function} iterator
 * @return {Aigle} Returns an Aigle instance
 * @example
 * const order = [];
 * const collection = [1, 5, 3, 4, 2];
 * const iterator = (num, index) => {
 *   return Aigle.delay(num * 10)
 *     .then(() => {
 *       order.push(num);
 *       return num;
 *     });
 * };
 * Aigle.sortByLimit(collection, 2, iterator)
 *   .then(array => {
 *     console.log(array); // [1, 2, 3, 4, 5]
 *     console.log(order); // [1, 3, 5, 2, 4]
 *   });
 *
 * @example
 * const order = [];
 * const collection = { a: 1, b: 5, c: 3, d: 4, e: 2 };
 * const iterator = (num, key) => {
 *   return Aigle.delay(num * 10)
 *     .then(() => {
 *       order.push(num);
 *       return num;
 *     });
 * };
 * Aigle.sortByLimit(collection, 2, iterator)
 *   .then(array => {
 *     console.log(array); // [1, 2, 3, 4, 5]
 *     console.log(order); // [1, 3, 5, 2, 4]
 *   });
 *
 * @example
 * const order = [];
 * const collection = [1, 5, 3, 4, 2];
 * const iterator = num => {
 *   return Aigle.delay(num * 10)
 *     .then(() => {
 *       order.push(num);
 *       return num;
 *     });
 * };
 * Aigle.sortByLimit(collection, iterator)
 *   .then(array => {
 *     console.log(array); // [1, 2, 3, 4, 5]
 *     console.log(order); // [1, 2, 3, 4, 5]
 *   });
 */
function sortByLimit(collection, limit, iterator) {
  if (typeof limit === 'function') {
    iterator = limit;
    limit = DEFAULT_LIMIT;
  }
  if (Array.isArray(collection)) {
    return new SortByLimitArray(collection, iterator, limit)._iterate();
  }
  if (collection && typeof collection === 'object') {
    return new SortByLimitObject(collection, iterator, limit)._iterate();
  }
  return Aigle.resolve([]);
}