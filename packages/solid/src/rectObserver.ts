import { Rect, RectObserver, RectObserverEntry } from "@chloranthy/core";
import { ReactiveMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export function makeRectObserver(
	callback: (entries: RectObserverEntry[]) => void,
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
		const observer = new RectObserver(document.documentElement, callback);
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

export const useRectObserver = createHydratableSingletonRoot(() => {
	const map = new ReactiveMap<HTMLElement, Rect | null>();
	const observer = makeRectObserver((entries) => {
		for (const { target, rect } of entries) {
			if (map.has(target)) {
				map.set(target, rect);
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
