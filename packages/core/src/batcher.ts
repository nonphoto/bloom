function microtask(): Promise<void> {
	return new Promise((resolve) => queueMicrotask(() => resolve()));
}

export class Batcher {
	#microtask: Promise<void> = Promise.resolve();
	#callbacks: Array<(() => void) | undefined> = [];
	#onRun: (run: () => void) => void = (run) => run();

	constructor(options?: { onRun?: (run: () => void) => void }) {
		this.#onRun = options?.onRun ?? this.#onRun;
	}

	#run() {
		this.#onRun(() => {
			for (let i = 0; i < this.#callbacks.length; i++) {
				this.#callbacks[i]?.call(undefined);
			}
			this.#callbacks = [];
		});
	}

	enqueue(callback?: () => void): Promise<void> {
		if (this.#callbacks.length === 0) {
			this.#microtask = microtask().then(() => this.#run());
		}
		this.#callbacks.push(callback);
		return this.#microtask;
	}
}
