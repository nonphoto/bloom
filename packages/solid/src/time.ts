import { createRAF } from "@solid-primitives/raf";
import { Accessor, batch, createEffect, createSignal } from "solid-js";

/**
 * A callback for an animation frame.
 * @param time - The time that the animation frame occurred.
 * @param deltaTime - The time since the last animation frame occurred.
 */
export type TimeCallback = (time: number, deltaTime: number) => void;

/**
 * Creates a new effect that calls the callback on every animation frame.
 * @param fn - The callback to call on animation frame.
 */
export function createTimeCallback(fn: TimeCallback): void {
	let time = performance.now();
	let deltaTime = 0;
	const startTime = time;

	const [, start] = createRAF((nextTime) => {
		deltaTime = nextTime - time;
		time = nextTime;
		fn(time - startTime, deltaTime);
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
