import { noop } from "@solid-primitives/utils";
import {
	createRoot,
	createSignal,
	getOwner,
	onCleanup,
	createContext,
	useContext,
	untrack,
	createUniqueId,
} from "solid-js";
import type { Accessor, ParentProps, JSX } from "solid-js";

function createRootWithContext<T>(fn: (dispose: () => void) => T) {
	const owner = getOwner();
	return createRoot((dispose) => {
		const rootOwner = getOwner();
		if (rootOwner && owner) {
			rootOwner.context = owner.context;
		}
		return fn(dispose);
	});
}

interface ZombieContextValue {
	unmounted: Accessor<boolean>;
	addUnmountedChild: (jsx: JSX.Element) => () => void;
	useDisposal: () => () => void;
}

export const ZombieContext = createContext<ZombieContextValue>();

export function useDisposal() {
	const context = useContext(ZombieContext);
	return context?.useDisposal() ?? noop;
}

export function useUnmounted() {
	const context = useContext(ZombieContext);
	return () => context?.unmounted();
}

export function Zombie(props: ParentProps) {
	const parent = useContext(ZombieContext);
	const [unmounted, setUnmounted] = createSignal(false);
	const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>(
		[],
	);
	const disposalDeps = new Map<string, boolean>();

	let removeUnmountedChild: (() => void) | undefined;

	const [jsx, dispose] = createRootWithContext((disposeRoot) => {
		const dispose = () => {
			disposeRoot();
			removeUnmountedChild?.();
		};

		const context: ZombieContextValue = {
			unmounted: () => unmounted() || (parent?.unmounted() ?? false),
			addUnmountedChild: (jsx) => {
				const object = [jsx];
				setUnmountedChildren((prev) => [...prev, object]);
				return () => {
					setUnmountedChildren((prev) =>
						prev.filter((item) => item !== object),
					);
				};
			},
			useDisposal: () => {
				const id = createUniqueId();

				disposalDeps.set(id, false);
				onCleanup(() => {
					disposalDeps.delete(id);
				});

				return () => {
					disposalDeps.set(id, true);
					if (
						untrack(unmounted) &&
						Array.from(disposalDeps.values()).every((value) => value)
					) {
						dispose();
					}
				};
			},
		};

		return [
			<ZombieContext.Provider value={context}>
				{props.children}
				{unmountedChildren()}
			</ZombieContext.Provider>,
			dispose,
		];
	});

	onCleanup(() => {
		setUnmounted(true);
		if (disposalDeps.size > 0) {
			removeUnmountedChild = parent?.addUnmountedChild(jsx);
		} else {
			dispose();
		}
	});

	return jsx;
}
