import type { Behavior } from "@chloranthy/core/src/index.ts";
import type { Accessor } from "solid-js";

import { toControls, toGenerator, behaviorDelay } from "@chloranthy/core/src/index.ts";
import { createSpringBehavior } from "@chloranthy/solid/src/index.ts";

import { createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function createAnimation(ref: Accessor<HTMLDivElement | null>, prop: string, behavior: Behavior<string>, opts: KeyframeAnimationOptions = { fill: "forwards" }) {
	return createEffect(() => {
		console.log({
			"ref": ref(),
			"prop": prop,
			"behavior": behavior,
			"opts": opts,
		})
		if (!ref()) return;
		const controls = toControls(
			toGenerator(
				ref()!,
				prop,
				behavior,
				opts,
			),
		);

		controls.play();

		onCleanup(() => {
			console.log({
				"cancel": true
			})
			controls.cancel();
		});
	});
}

export function DynamicIsland() {
	const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
	const [state, setState] = createStore({
		width: 0,
		height: 0,
		radius: 9999,
	});

	const [posx, velx] = createSpringBehavior(() => state.width, { halflife: 100 });
	// const y = createSpringBehavior(() => state.height, { halflife: 100 });
	// const rad = createSpringBehavior(() => state.radius, { halflife: 100 });

	// createAnimation(ref, "width", behaviorDelay(performance.now(), (t) => {
	// 	return `${posx(t)}px`
	// }));
	createAnimation(ref, "filter", behaviorDelay(performance.now(), (t) => {
		const vel = clamp(velx(t)! * 1e40, 0, 10);
		// console.log({
		// 	"t": t,
		// 	"velx(t)": vel,
		// 	"lerp(0, 10, velx(t)!)": lerp(0, 10, vel!)
		// })
		return `blur(${lerp(0, 10, vel)}px)`
	}));

	// createEffect(() => {
	// 	if (!ref()) return;
	// 	const controls = toControls(
	// 		toGenerator(
	// 			ref()!,
	// 			"width",
	// 			behaviorDelay(performance.now(), (t) => {
	// 				console.log({
	// 					"t": t,
	// 					"posx": posx(t),
	// 				})
	// 				return `${posx(t)}px`;
	// 			}),
	// 			{ fill: "forwards" },
	// 		),
	// 	);

	// 	controls.play();

	// 	onCleanup(() => {
	// 		controls.cancel();
	// 	});
	// });

	return (
		<div class="relative">
			<div
				ref={setRef}
				class="min-w-[100px] min-h-[28px] overflow-hidden rounded-full bg-black"
				onPointerEnter={() => {
					setState("width", 148);
					setState("height", 148);
					setState("radius", 32);
				}}
				onPointerLeave={() => {
					setState("width", 100);
					setState("height", 28);
					setState("radius", 9999);
				}}
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
