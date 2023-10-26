/**
 *
 *
 * @export
 * @class Queue
 * @typedef {Queue}
 * @template T
 */
export class Queue<T> {
  /**
   *
   *
   * @private
   * @readonly
   * @type {{}}
   */
  private readonly elements = [] as T[];

  /**
   *
   *
   * @param {T} item
   */
  enque(item: T) {
    this.elements.push(item);
  }

  /**
   *
   *
   * @returns {*}
   */
  dequeue() {
    return this.elements.shift();
  }

  /**
   *
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.elements.length === 0;
  }

  /**
   *
   *
   * @returns {*}
   */
  peek() {
    return !this.isEmpty() ? this.elements[0] : undefined;
  }
}
