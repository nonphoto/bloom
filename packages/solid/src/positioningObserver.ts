import {
	PositioningObserver,
	PositioningObserverEntry,
} from "@bloom-motion/core/src/index.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export function makePositioningObserver(
	callback: (entries: PositioningObserverEntry[]) => void,
): {
	invalidate(element: HTMLElement): Promise<void>;
	observe(target: HTMLElement): void;
	unobserve(target: HTMLElement): void;
} {
	if (isServer) {
		return {
			async invalidate() {},
			observe() {},
			unobserve() {},
		};
	} else {
		const observer = new PositioningObserver(
			document.documentElement,
			callback,
		);
		onCleanup(() => {
			observer.disconnect();
		});
		return {
			invalidate: observer.invalidate.bind(observer),
			observe: observer.observe.bind(observer),
			unobserve: observer.unobserve.bind(observer),
		};
	}
}

export const usePositioningObserver = createHydratableSingletonRoot(() => {
	const map = new ReactiveMap<HTMLElement, HTMLElement | null>();
	const observer = makePositioningObserver((entries) => {
		for (const { target, containingElement } of entries) {
			if (map.has(target)) {
				map.set(target, containingElement);
			}
		}
	});

	return {
		invalidate: observer.invalidate,
		use(element: HTMLElement) {
			map.set(element, null);
			observer.observe(element);

			onCleanup(() => {
				map.delete(element);
				observer.unobserve(element);
			});

			return () => map.get(element) ?? undefined;
		},
	};
});
