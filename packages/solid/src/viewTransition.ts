import { Matcher, Rect } from "@chloranthy/core";
import { createSubRoot } from "@solid-primitives/rootless";
import { Directive, MaybeAccessor, access } from "@solid-primitives/utils";
import {
	type Accessor,
	createComputed,
	createEffect,
	createSignal,
	getOwner,
	on,
	untrack,
} from "solid-js";
import { useRectObserver } from "./rectObserver";
import { useDisposal, useUnmounted } from "./zombie";

export interface ViewTransitionOptions {
	onEnterMatch?: (
		element: HTMLElement,
		match: ReactiveAnimation | undefined,
	) => ReactiveAnimation | undefined;
	onExitMatch?: (
		element: HTMLElement,
		match: ReactiveAnimation | undefined,
	) => ReactiveAnimation | undefined;
	onEnter?: (element: HTMLElement) => ReactiveAnimation | undefined;
	onExit?: (element: HTMLElement) => ReactiveAnimation | undefined;
}

export interface ReactiveAnimation {
	isFinished: Accessor<boolean>;
}

export function setInert(element: HTMLElement, rect: Rect) {
	element.style.width = rect?.width + "px";
	element.style.height = rect?.height + "px";
	element.style.position = "absolute";
	element.inert = true;
}

function makeViewTransition(
	element: HTMLElement,
	options: ViewTransitionOptions,
) {
	const owner = getOwner();
	const { onEnterMatch, onExitMatch, onEnter, onExit } = options;
	const matcher = new Matcher<
		Accessor<ReactiveAnimation | undefined>,
		ReactiveAnimation | undefined
	>();
	const [animation, setAnimation] = createSignal<
		ReactiveAnimation | undefined
	>();
	const unmounted = useUnmounted();
	const releaseDisposal = useDisposal();
	const rectObserver = useRectObserver();

	const createOnAnimationFinished = (fn: () => void) => {
		createEffect(() => {
			if (animation()?.isFinished() ?? true) {
				fn();
			}
		});
	};

	const onEnterSuccess = (match: ReactiveAnimation | undefined) => {
		createSubRoot((dispose) => {
			setAnimation(onEnterMatch?.(element, match) ?? undefined);
			createOnAnimationFinished(dispose);
		}, owner);
	};

	const onEnterFailure = () => {
		createSubRoot((dispose) => {
			setAnimation(onEnter?.(element) ?? undefined);
			createOnAnimationFinished(dispose);
		}, owner);
	};

	const onExitSuccess = (match: Accessor<ReactiveAnimation | undefined>) => {
		createSubRoot(() => {
			createEffect(
				on(match, (matchValue) => {
					setAnimation(onExitMatch?.(element, matchValue) ?? undefined);
					createOnAnimationFinished(releaseDisposal);
				}),
			);
		}, owner);
	};

	const onExitFailure = () => {
		createSubRoot(() => {
			setAnimation(onExit?.(element) ?? undefined);
			createOnAnimationFinished(releaseDisposal);
		}, owner);
	};

	matcher.attemptEnter(animation, onEnterSuccess, onEnterFailure);

	createEffect(
		on(
			unmounted,
			() => {
				rectObserver.getRect(element).then((rect) => {
					setInert(element, rect);
				});
				matcher.attemptExit(untrack(animation), onExitSuccess, onExitFailure);
			},
			{ defer: true },
		),
	);
}

export function createViewTransition(
	element: MaybeAccessor<HTMLElement | null | undefined>,
	options: MaybeAccessor<ViewTransitionOptions | undefined>,
) {
	createComputed(() => {
		const elementValue = access(element);
		const optionsValue = access(options);

		if (elementValue && optionsValue) {
			makeViewTransition(elementValue, optionsValue);
		}
	});
}

export const viewTransition: Directive<ViewTransitionOptions> = (
	target,
	options,
) => {
	if (target instanceof HTMLElement) {
		createViewTransition(target, options);
	}
};
