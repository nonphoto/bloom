import { createEventListener } from "@solid-primitives/event-listener";
import { comp, map } from "@thi.ng/transducers";
import { set2, Vec } from "@thi.ng/vectors";
import { createEffect, createSignal } from "solid-js";
import {
	animation,
	createMousePosition,
	createSpring2,
	createSpringPosition2,
	keyframes,
	run,
	safeDocument,
	styleTranslate,
} from "~/../src";

export default function SpringRoute() {
	let element: HTMLDivElement;
	const mousePosition = createMousePosition();
	const [target, setTarget] = createSignal<Vec | undefined>(undefined, {
		equals: false,
	});

	const spring = createSpring2(undefined, undefined, target);
	const springPosition = createSpringPosition2(spring);

	createEventListener(safeDocument()?.body, "click", () => {
		setTarget((prev) => set2(prev ?? [], mousePosition()));
	});

	createEffect(() => {
		run(
			comp(
				springPosition(),
				map(styleTranslate),
				keyframes("transform"),
				animation(element),
			),
			console.log,
		).then(console.log);
	});

	return (
		<div
			ref={element!}
			style={{
				position: "fixed",
				inset: "0 auto auto 0",
				background: "skyblue",
				width: "4rem",
				height: "4rem",
				transform: styleTranslate(target()),
			}}
		/>
	);
}
