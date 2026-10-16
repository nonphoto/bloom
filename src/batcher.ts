export function waitForMicrotask(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(() => resolve()));
}

export function waitForTask(): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
}

export function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function waitForTimeout(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export type BatcherCallback<T> = (value: T) => void;

export type BatcherOptions = { wait?: () => Promise<void> };

export class Batcher extends EventTarget {
  #promise: Promise<void> | null = null;
  #wait: () => Promise<void> = waitForMicrotask;

  constructor(options?: BatcherOptions) {
    super();
    this.#wait = options?.wait ?? this.#wait;
  }

  enqueue(callback?: () => void) {
    if (this.#promise == null) {
      this.dispatchEvent(new Event("first-enqueue"));
    }
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
