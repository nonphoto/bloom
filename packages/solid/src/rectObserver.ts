import { Rect, RectObserver, RectObserverEntry } from "@chloranthy/core/src/index.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export function makeRectObserver(
	callback: (entries: RectObserverEntry[]) => void,
): {
	invalidate(element: HTMLElement): Promise<void>;
	getRect(element: HTMLElement): Promise<Rect>;
	observe(target: HTMLElement): void;
	unobserve(target: HTMLElement): void;
} {
	if (isServer) {
		return {
			async invalidate() {},
			async getRect() {
				return new Promise<Rect>(() => {});
			},
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
			getRect: observer.getRect.bind(observer),
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
		getRect: observer.getRect,
		use(element: MaybeAccessor<HTMLElement | undefined>) {
			createEffect(() => {
				const elementValue = access(element);
				if (elementValue) {
					map.set(elementValue, null);
					observer.observe(elementValue);

					onCleanup(() => {
						map.delete(elementValue);
						observer.unobserve(elementValue);
					});
				}
			});

			return () => {
				const elementValue = access(element);
				return elementValue ? map.get(elementValue) ?? undefined : undefined;
			};
		},
	};
});
