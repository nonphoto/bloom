import {
	Layout,
	Mat2d,
	Rect,
	catchMaybe,
	layoutCreate,
	mat2dClone,
	maybe,
	vec2Create,
} from "@bloom-motion/core/src/index.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { Accessor, createComputed, createMemo, createRoot } from "solid-js";
import { usePositioningObserver } from "./positioningObserver";
import { useRectObserver } from "./rectObserver";
import { SingletonMap } from "./singletonMap";

type LayoutTreeReturn = {
	use(
		element: MaybeAccessor<HTMLElement | undefined>,
	): Accessor<Layout | undefined>;
	setTransform(element: HTMLElement, transform: Mat2d | undefined): void;
};

const zero = vec2Create();

export const useLayoutTree = createHydratableSingletonRoot<LayoutTreeReturn>(
	() => {
		const positioningObserver = usePositioningObserver();
		const rectObserver = useRectObserver();

		const transforms = new ReactiveMap<HTMLElement, Mat2d>();

		const layouts: SingletonMap<
			HTMLElement,
			Accessor<Layout | undefined>
		> = new SingletonMap((element) => {
			const containingElement = positioningObserver.use(element);
			const rect = rectObserver.use(element);
			const parentLayout = use(containingElement);
			return createMemo(
				catchMaybe(() =>
					layoutCreate(
						maybe(parentLayout()),
						maybe(rect()),
						() => transforms.get(element),
						() => zero,
					),
				),
			);
		});

		const use = (element: MaybeAccessor<HTMLElement | undefined>) => {
			const memo = createMemo(
				catchMaybe(() => layouts.use(maybe(access(element)))),
			);
			return () => memo()?.();
		};

		return {
			use,
			setTransform(element, transform) {
				if (transform) {
					// TODO: Get rid of mat2dClone
					transforms.set(element, mat2dClone(transform));
				} else {
					transforms.delete(element);
				}
			},
		};
	},
);

export function useLayout(element: MaybeAccessor<HTMLElement | undefined>) {
	return useLayoutTree().use(element);
}

export function useRect(element: MaybeAccessor<HTMLElement | undefined>) {
	const layout = useLayout(element);
	return () => layout()?.rect;
}

export function useMatrix(element: MaybeAccessor<HTMLElement | undefined>) {
	const layout = useLayout(element);
	return () => layout()?.matrix();
}

export function useTransform(element: MaybeAccessor<HTMLElement | undefined>) {
	const layout = useLayout(element);
	return () => layout()?.transform();
}

export function getRect(element: HTMLElement): Promise<Rect> {
	const rectObserver = useRectObserver();
	return createRoot((dispose) => {
		return new Promise<Rect>((resolve, reject) => {
			const rect = rectObserver.use(element);
			createComputed(() => {
				const rectValue = rect();
				if (rectValue) {
					resolve(rectValue);
				}
			});
			rectObserver.invalidate(element).then(reject);
		}).finally(dispose);
	});
}
