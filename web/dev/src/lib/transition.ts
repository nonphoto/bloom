import {
	BodyQuad2d,
	bodyQuad2dCreate,
	bodyQuad2dFromRect,
	catchMaybe,
	maybe,
	quad2dCreate,
	quad2dFromRect,
} from "@chloranthy/core";
import {
	ReactiveAnimation,
	ViewTransitionMatch,
	createSetQuad,
	createSpringBehaviorQuad2d,
	useRect,
} from "@chloranthy/solid";
import { createMemo, createSignal, untrack } from "solid-js";

export function onEnterMatch(
	element: HTMLElement,
	match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
	const rect = useRect(element);

	const [body, setBody] = createSignal<BodyQuad2d>(
		match.animation
			? untrack(match.animation.body)
			: bodyQuad2dFromRect(bodyQuad2dCreate(), match.rect),
		{ equals: false },
	);
	const targetQuad = createMemo(
		catchMaybe((out) => quad2dFromRect(out, maybe(rect()))),
		quad2dCreate(),
		{ equals: false },
	);
	const quad = createSpringBehaviorQuad2d(targetQuad, { halflife: 300 });
	// TODO: Implement isFinished
	const isFinished = () => quad() != null && false;
	createSetQuad(element, () => body().p);
	return {
		isFinished,
		body,
	};
}

export function onExitMatch(
	element: HTMLElement,
	match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
	if (match.animation) {
		const body = match.animation.body;
		createSetQuad(element, () => body().p);
		return match.animation;
	}
}
