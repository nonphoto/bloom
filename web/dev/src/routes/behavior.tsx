import { createSpringBehavior } from "@chloranthy/solid";
import { createEventListener } from "@solid-primitives/event-listener";
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

	const x = createSpringBehavior(() => mousePosition.x, { halflife: 100 });
	const y = createSpringBehavior(() => mousePosition.y, { halflife: 100 });

	return (
		<div
			style={{
				width: "100px",
				height: "100px",
				background: "skyblue",
			}}
		></div>
	);

	// createEffect(() => {
	// 	const controls = toControls(
	// 		toGenerator(
	// 			element,
	// 			"transform",
	// 			behaviorDelay(performance.now(), (t) => {
	// 				return `translate(${x(t)}px, ${y(t)}px)`;
	// 			}),
	// 			{ fill: "forwards" },
	// 		),
	// 	);

	// 	controls.play();

	// 	onCleanup(() => {
	// 		controls.cancel();
	// 	});
	// });

	return element;
}
