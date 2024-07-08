import { createSubRoot } from "@solid-primitives/rootless";
import {
	Accessor,
	EffectFunction,
	Owner,
	createComputed,
	createMemo,
	getOwner,
	on,
	runWithOwner,
} from "solid-js";

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

export const createObject =
	<T>(create: () => T) =>
	(fn: EffectFunction<T>): Accessor<T> => {
		return createMemo(fn, create(), { equals: false });
	};

export const createMaybeObject =
	<T>(create: () => T) =>
	(fn: EffectFunction<T | undefined>): Accessor<T | undefined> => {
		const v = create();
		return createMemo(() => fn(v), undefined, { equals: false });
	};
