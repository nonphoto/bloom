import {
	Layout,
	catchMaybe,
	layoutCreate,
	mat2dCreate,
	maybe,
	vec2Create,
} from "@chloranthy/core";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";
import { usePositioningObserver } from "./positioningObserver";
import { useRectObserver } from "./rectObserver";
import { SingletonMap } from "./singletonMap";

type LayoutTreeReturn = {
	use(
		element: MaybeAccessor<HTMLElement | undefined>,
	): Accessor<Layout | undefined>;
};

export function createLayoutTree(): LayoutTreeReturn {
	const positioningObserver = usePositioningObserver();
	const rectObserver = useRectObserver();

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
					() => mat2dCreate(),
					() => vec2Create(),
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
	};
}
