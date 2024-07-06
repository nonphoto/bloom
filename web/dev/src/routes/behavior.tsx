import { behaviorDelay, toControls, toGenerator } from "@chloranthy/core";
import { createSpringBehavior } from "@chloranthy/solid/src/index.ts";

import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

function safeDocument() {
	return typeof document != "undefined" ? document : undefined;
}

export default function Behaviour () {
	const [mousePosition, setMousePosition] = createStore({ x: 0, y: 0 });

	onMount(() => {
		console.log({
			"safeDocument": safeDocument(),
			"body": safeDocument()?.documentElement,
		})
		createEventListener(
			() => safeDocument()?.documentElement,
			"click",
			(event: MouseEvent) => {
				console.log(event)
				setMousePosition({ x: event.clientX, y: event.clientY });
			},
		);
	});

	const x = createSpringBehavior(() => mousePosition.x, { halflife: 100 });
	const y = createSpringBehavior(() => mousePosition.y, { halflife: 100 });

	const [element, setElement] = createSignal<HTMLDivElement | null>(null);

	createEffect(() => {
		if (!element()) return;
		const controls = toControls(
			toGenerator(
				element()!,
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

	return (
		<div
			ref={setElement}
			style={{
				width: "100px",
				height: "100px",
				background: "skyblue",
			}}
		></div>
	);
}
