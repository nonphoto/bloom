import {
	behaviorDelay,
	toControls,
	toGenerator,
} from "@bloom-motion/core/src/index.ts";
import { createSpringBehavior } from "@bloom-motion/solid/src/index.ts";
import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

function safeDocument() {
	return typeof document != "undefined" ? document : undefined;
}

export default function () {
	const [mousePosition, setMousePosition] = createStore({ x: 0, y: 0 });
	createEventListener(
		() => safeDocument()?.body,
		"click",
		(event: MouseEvent) => {
			setMousePosition({ x: event.clientX, y: event.clientY });
		},
	);

	const element = (
		<div
			style={{
				width: "100px",
				height: "100px",
				background: "skyblue",
			}}
		></div>
	) as Element;

	const x = createSpringBehavior(() => mousePosition.x, { halflife: 100 });
	const y = createSpringBehavior(() => mousePosition.y, { halflife: 100 });

	createEffect(() => {
		const controls = toControls(
			toGenerator(
				element,
				"transform",
				behaviorDelay(performance.now(), (t) => {
					return `translate(${x(t)}px, ${y(t)}px)`;
				}),
				{ fill: "forwards" },
			),
		);

		controls.play();

		onCleanup(() => {
			controls.cancel();
		});
	});

	return element;
}
