import { createSubRoot } from "@solid-primitives/rootless";
import {
	MaybeAccessor as SolidMaybeAccessor,
	access,
} from "@solid-primitives/utils";
import {
	Accessor,
	Owner,
	createComputed,
	createMemo,
	getOwner,
	on,
	runWithOwner,
} from "solid-js";

/**
 * @private
 */
export type MaybeAccessor<T> = SolidMaybeAccessor<T>;

/**
 * @private
 */
export type MapMaybeAccessor<T> = T extends any[]
	? {
			[K in keyof T]: MaybeAccessor<T[K] | undefined>;
		}
	: never;

/**
 * @private
 */
export function maybe<F extends (...args: any[]) => any>(
	fn: F,
	...args: MapMaybeAccessor<Parameters<F>>
): ReturnType<F> | undefined {
	const values = args.map(access);
	if (!values.some((value) => value == null)) {
		return fn(...values);
	}
}

/**
 * @private
 */
export function createMaybeMemo<F extends (...args: any[]) => any>(
	fn: F,
	...args: MapMaybeAccessor<Parameters<F>>
): Accessor<ReturnType<F> | undefined> {
	return createMemo<ReturnType<F> | undefined>(
		() => maybe(fn, ...args),
		undefined,
		{
			equals: false,
		},
	);
}

/**
 * @private
 */
export function safeWindow() {
	return typeof window !== "undefined" ? window : undefined;
}

/**
 * @private
 */
export function awaitWithOwner<T>(
	promise: Promise<T>,
	onFulfilled: (value: T) => void,
	onRejected?: () => void,
	owner: Owner | null = getOwner(),
): Promise<void> {
	return promise.then(
		(value) => {
			runWithOwner(owner, () => {
				onFulfilled(value);
			});
		},
		onRejected
			? () => {
					runWithOwner(owner, onRejected);
				}
			: undefined,
	);
}

export function createOnce<T>(
	dep: Accessor<T>,
	fn: (value: NonNullable<T>) => void,
) {
	const owner = getOwner();
	createSubRoot((dispose) => {
		createComputed(
			on(dep, (value) => {
				if (value) {
					createSubRoot(() => {
						fn(value);
					}, owner);
					dispose();
				}
			}),
		);
	});
}
