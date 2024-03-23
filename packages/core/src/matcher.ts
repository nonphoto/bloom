import { Batcher } from "./batcher";

type Attempt<T, U> = {
	value: T;
	onSuccess: (value: U) => void;
	onFailure: () => void;
};

export class Matcher<T, Enter, Exit> {
	#entering = new Map<T, Attempt<Enter, Exit>[]>();
	#exiting = new Map<T, Attempt<Exit, Enter>[]>();
	#onRun: (run: () => void) => void = (run) => run();
	#batcher = new Batcher({
		onRun: (run) => {
			const keys = new Set([...this.#entering.keys(), ...this.#exiting.keys()]);
			for (const key of keys) {
				const entering = this.#entering.get(key) ?? [];
				const exiting = this.#exiting.get(key) ?? [];
				let i = 0;
				while (i < (entering?.length ?? 0)) {
					if (i === 0 && entering[i] && exiting[i]) {
						entering[i]!.onSuccess(exiting[i]!.value);
						exiting[i]!.onSuccess(entering[i]!.value);
					} else {
						if (entering[i]) {
							entering[i]?.onFailure();
						}
						if (exiting[i]) {
							exiting[i]?.onFailure();
						}
					}
					i++;
				}
				while (i < (exiting?.length ?? 0)) {
					if (exiting[i]) {
						exiting[i]?.onFailure();
					}
					i++;
				}
			}

			this.#onRun(run);

			this.#entering = new Map<T, Attempt<Enter, Exit>[]>();
			this.#exiting = new Map<T, Attempt<Exit, Enter>[]>();
		},
	});

	constructor(options?: { onRun?: () => void }) {
		this.#onRun = options?.onRun ?? this.#onRun;
	}

	#attempt<Send, Receive>(
		key: T,
		value: Send,
		map: Map<T, Attempt<Send, Receive>[]>,
		onSuccess: (value: Receive) => void,
		onFailure: () => void,
	): void {
		const mutation = { value, onSuccess, onFailure };
		const array = map.get(key);
		if (array) {
			array.push(mutation);
		} else {
			map.set(key, [mutation]);
		}
		this.#batcher.task();
	}

	attemptEnter(
		key: T,
		value: Enter,
		onSuccess: (value: Exit) => void,
		onFailure: () => void,
	): void {
		this.#attempt(key, value, this.#entering, onSuccess, onFailure);
	}

	attemptExit(
		key: T,
		value: Exit,
		onSuccess: (value: Enter) => void,
		onFailure: () => void,
	): void {
		this.#attempt(key, value, this.#exiting, onSuccess, onFailure);
	}
}
