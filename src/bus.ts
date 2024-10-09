export type Listener<U> = (value: U) => void;

export class Bus<T extends WeakKey, U> {
	#map = new WeakMap<T, Set<Listener<U>>>();

	add(key: T, listener: Listener<U>) {
		const listeners = this.#map.get(key);
		if (listeners) {
			listeners.add(listener);
		} else {
			this.#map.set(key, new Set([listener]));
		}
	}

	remove(key: T, listener: Listener<U>) {
		const listeners = this.#map.get(key);
		if (listeners) {
			if (listeners.size <= 1) {
				this.#map.delete(key);
			} else {
				listeners.delete(listener);
			}
		}
	}

	has(key: T) {
		const listeners = this.#map.get(key);
		return listeners && listeners.size > 0;
	}

	send(key: T, value: U) {
		for (const listener of this.#map.get(key) ?? []) {
			listener.call(undefined, value);
		}
	}

	clear() {
		this.#map = new WeakMap();
	}
}
