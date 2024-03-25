import { createSubRoot } from "@solid-primitives/rootless";
import {
	Accessor,
	Owner,
	createComputed,
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
