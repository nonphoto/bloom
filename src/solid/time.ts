import { createRAF } from "@solid-primitives/raf";
import { Accessor, batch, createEffect, createSignal } from "solid-js";

/**
 * A callback for an animation frame.
 * @param time - The time that the animation frame occurred.
 * @param deltaTime - The time since the last animation frame occurred.
 */
export type TimeCallback = (time: number, deltaTime: number) => void;

export class Clock {
	#time = performance.now();
	#deltaTime = 0;

	tick() {
		const nextTime = performance.now();
		this.#deltaTime = nextTime - this.#time;
		this.#time = nextTime;
	}

	get time() {
		return this.#time;
	}

	get deltaTime() {
		return this.#deltaTime;
	}
}

/**
 * Creates a new effect that calls the callback on every animation frame.
 * @param fn - The callback to call on animation frame.
 */
export function createTimeCallback(fn: TimeCallback): void {
	const clock = new Clock();
	const startTime = clock.time;

	const [, start] = createRAF(() => {
		clock.tick();
		fn(clock.time - startTime, clock.deltaTime);
	});

	createEffect(() => {
		start();
	});
}

/**
 * A time and delta-time accessor pair.
 */
export type CreateTimeReturn = [
	/**
	 * The time that the animation frame occurred. Updates every animation frame.
	 */
	Accessor<number>,

	/**
	 * The time since the last animation frame occurred. Updates every animation frame.
	 */
	Accessor<number>,
];

/**
 * Creates a new time and delta-time accessor pair.
 */
export function createTime(): CreateTimeReturn {
	const [time, setTime] = createSignal(0, { equals: false });
	const [deltaTime, setDeltaTime] = createSignal(0, { equals: false });

	createTimeCallback((t, dt) => {
		batch(() => {
			setTime(t);
			setDeltaTime(dt);
		});
	});

	return [time, deltaTime];
}
