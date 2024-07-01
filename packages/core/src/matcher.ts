import { Batcher, BatcherCallback } from "./batcher";

export type MatcherAttempt<T, U> = {
	value: T;
	onSuccess: (value: U) => void;
	onFailure: () => void;
};

export class Matcher<Enter, Exit> {
	#entering = new Set<MatcherAttempt<Enter, Exit>>();
	#exiting = new Set<MatcherAttempt<Exit, Enter>>();
	#onRun: (run: BatcherCallback<void>) => void = (run) => run();
	#batcher = new Batcher({
		onRun: (run) => {
			const entering = this.#entering.values();
			const exiting = this.#exiting.values();

			const firstEnter = entering.next();
			const firstExit = exiting.next();

			if (!firstEnter.done && !firstExit.done) {
				firstEnter.value.onSuccess(firstExit.value.value);
				firstExit.value.onSuccess(firstEnter.value.value);
			}

			for (const attempt of entering) {
				attempt.onFailure();
			}

			for (const attempt of exiting) {
				attempt.onFailure();
			}

			this.#onRun(run);

			this.#entering.clear();
			this.#exiting.clear();
		},
	});

	constructor(options?: { onRun?: (run: BatcherCallback<void>) => void }) {
		this.#onRun = options?.onRun ?? this.#onRun;
	}

	#attempt<Send, Receive>(
		value: Send,
		set: Set<MatcherAttempt<Send, Receive>>,
		onSuccess: (value: Receive) => void,
		onFailure: () => void,
	): void {
		set.add({ value, onSuccess, onFailure });
		this.#batcher.task();
	}

	attemptEnter(
		value: Enter,
		onSuccess: (value: Exit) => void,
		onFailure: () => void,
	): void {
		this.#attempt(value, this.#entering, onSuccess, onFailure);
	}

	attemptExit(
		value: Exit,
		onSuccess: (value: Enter) => void,
		onFailure: () => void,
	): void {
		this.#attempt(value, this.#exiting, onSuccess, onFailure);
	}
}
