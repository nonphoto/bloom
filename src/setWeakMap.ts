export class SetWeakMap<T extends WeakKey, U> {
  #map: WeakMap<T, Set<U>>;

  constructor(entries?: readonly (readonly [T, Set<U>])[] | null | undefined) {
    this.#map = new WeakMap(entries);
    this.#map.set;
  }

  add(key: T, value: U): void {
    const set = this.#map.get(key);
    if (set) {
      set.add(value);
    } else {
      this.#map.set(key, new Set([value]));
    }
  }

  get(key: T): Set<U> | undefined {
    return this.#map.get(key);
  }

  has(key: T, value: U): boolean {
    return this.#map.get(key)?.has(value) ?? false;
  }

  delete(key: T): void {
    this.#map.delete(key);
  }
}
