import { toControls, toGenerator, behaviorDelay } from "@chloranthy/core";
import { createSpringBehavior } from "@chloranthy/solid";

import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

export function DynamicIsland() {
	const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
	const [state, setState] = createStore({
		width: 0,
		height: 0,
		radius: 9999,
	});

	createEventListener(
		() => ref()!,
		"onmouseover",
		() => {
			setState("width", 148);
			setState("height", 148);
			setState("radius", 32);
		},
	);

	const x = createSpringBehavior(() => state.width, { halflife: 100 });
	// const y = createSpringBehavior(() => state.height, { halflife: 100 });
	// const rad = createSpringBehavior(() => state.radius, { halflife: 100 });

	function directive(el: HTMLElement, property: string) {
	createEffect(() => {
		if (!ref()) return;
		const controls = toControls(
			toGenerator(
				ref()!,
				"width",
				behaviorDelay(performance.now(), (t) => {
					return `${x(t)}px`;
				}),
				{ fill: "forwards" },
			),
		);

		controls.play();

		onCleanup(() => {
			controls.cancel();
		});
	});
}

	return (
		<div class="relative">
			<div
				ref={setRef}
				class="min-w-[100px] min-h-[28px] overflow-hidden rounded-full bg-black"
				// style={{
				// 	width: state.width + "px",
				// 	height: state.height + "px",
				// 	"border-radius": state.radius + "px",
				// }}
			>
				<div class="h-[28px]"></div>
			</div>
		</div>
	);
}
