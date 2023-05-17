export class Queue<T> {
  private readonly elements = [] as T[];

  enque(item: T) {
    this.elements.push(item);
  }

  dequeue() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  peek() {
    return !this.isEmpty() ? this.elements[0] : undefined;
  }
}
