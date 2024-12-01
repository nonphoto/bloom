export function waitForMicrotask(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(() => resolve()));
}

export function waitForTask(): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
}

export function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export type BatcherCallback<T> = (value: T) => void;

export class Batcher extends EventTarget {
  #promise: Promise<void> | null = null;
  #wait: () => Promise<void> = waitForMicrotask;

  constructor(options?: { wait?: () => Promise<void> }) {
    super();
    this.#wait = options?.wait ?? this.#wait;
  }

  enqueue(callback?: () => void) {
    if (callback) {
      this.addEventListener("run", callback, { once: true, passive: true });
    }
    if (this.#promise == null) {
      this.#promise = this.#wait().then(() => {
        this.dispatchEvent(new Event("prerun"));
        this.dispatchEvent(new Event("run"));
        this.dispatchEvent(new Event("postrun"));
        this.#promise = null;
      });
    }
  }
}
