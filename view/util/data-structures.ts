/**
 * From https://github.com/lukasios12/tsheap
 */
export class Heap<K> {
  protected items: Array<K>;
  public compare: (a: K, b: K) => number;

  public constructor(cf: (a: K, b: K) => number) {
    this.items = new Array<K>();
    this.compare = cf;
  }

  public copy(): Heap<K> {
    const heap = new Heap(this.compare);
    heap.items = [...this.items];
    return heap;
  }

  public extract(): K {
    const res = this.items[0];
    this.swap(0, this.size() - 1);
    this.items.pop();
    this.heapify(0);
    return res;
  }

  public insert(item: K): void {
    this.items.push(item);
    this.rootify(this.size() - 1);
  }

  public isEmpty(): boolean {
    return this.size() == 0;
  }

  public size(): number {
    return this.items.length;
  }

  public toArray(): Array<K> {
    return this.items;
  }

  protected heapify(i: number): void {
    const l = Heap.left(i);
    const r = Heap.right(i);
    let min = i;
    if (r < this.size()) {
      min = this.compare(this.items[l], this.items[r]) == -1 ? l : r;
    } else if (l < this.size()) {
      min = l;
    }
    if (this.compare(this.items[i], this.items[min]) == 1) {
      this.swap(i, min);
      this.heapify(min);
    }
  }

  protected rootify(i: number): void {
    const p = Heap.parent(i);
    const n = this.compare(this.items[i], this.items[p]);
    if (n == -1) {
      this.swap(i, p);
      this.rootify(p);
    }
  }

  protected swap(i: number, j: number): void {
    const temp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = temp;
  }

  protected static parent(i: number): number {
    return Math.max(0, Math.ceil(i / 2) - 1);
  }

  protected static left(i: number): number {
    return 2 * i + 1;
  }

  protected static right(i: number): number {
    return 2 * i + 2;
  }
}
