export function waitForMicrotask(): Promise<void> {
	return new Promise((resolve) => queueMicrotask(() => resolve()));
}

export function waitForAnimationFrame(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export type BatcherCallback<T> = (value: T) => void;

export class Batcher<T = void> {
	#promise: Promise<void> = Promise.resolve();
	#callbacks: Array<BatcherCallback<T> | undefined> = [];
	#wait: () => Promise<void> = waitForMicrotask;
	#onRun: (run: BatcherCallback<T>) => void;

	constructor(options?: {
		onRun?: (run: BatcherCallback<T>) => void;
		wait?: () => Promise<void>;
	}) {
		this.#onRun = options?.onRun ?? (() => {});
		this.#wait = options?.wait ?? this.#wait;
	}

	#run() {
		this.#onRun((value) => {
			for (let i = 0; i < this.#callbacks.length; i++) {
				this.#callbacks[i]?.(value);
			}
			this.#callbacks = [];
		});
	}

	task(callback?: (value: T) => void): Promise<void> {
		if (this.#callbacks.length === 0) {
			this.#promise = this.#wait().then(() => this.#run());
		}
		this.#callbacks.push(callback);
		return this.#promise;
	}
}
