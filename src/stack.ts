export default class Stack<T> {
  private readonly elements: T[];

  public constructor() {
    this.elements = [];
  }

  public empty(): boolean {
    return this.elements.length === 0;
  }

  public push(element: T) {
    this.elements.push(element);
  }

  public pop(): T {
    if (this.empty()) {
      throw new Error('Stack is empty');
    }

    return this.elements.pop();
  }

  public top(): T {
    if (this.empty()) {
      throw new Error('Stack is empty');
    }

    return this.elements[this.elements.length - 1];
  }
}
