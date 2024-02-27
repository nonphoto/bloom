import {
	Spring,
	SpringOptions,
	behaviorDelay,
	springBehavior,
	springCreate,
	springPosition,
	springVelocity,
	toControls,
	toGenerator,
} from "@chloranthy/core";
import { access } from "@solid-primitives/utils";
import { MaybeAccessor } from "@chloranthy/solid";
import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect, createMemo, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

function safeDocument() {
	return typeof document != "undefined" ? document : undefined;
}

function createSpring(options: MaybeAccessor<Partial<SpringOptions>>) {
	let time = performance.now();
	return createMemo<Spring>((prev) => {
		const nextTime = performance.now();
		const deltaTime = nextTime - time;
		time = nextTime;
		const optionsValue = access(options);
		return prev
			? springCreate({
					start: springPosition(prev, deltaTime),
					startVelocity: springVelocity(prev, deltaTime),
					...optionsValue,
				})
			: springCreate(optionsValue);
	});
}

function createSpringBehavior(options: MaybeAccessor<Partial<SpringOptions>>) {
	const spring = createSpring(options);
	return createMemo(() => springBehavior(spring()));
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
		>
			Hello
		</div>
	) as Element;

	const x = createSpringBehavior(() => ({
		end: mousePosition.x,
		halflife: 100,
	}));
	const y = createSpringBehavior(() => ({
		end: mousePosition.y,
		halflife: 100,
	}));

	createEffect(() => {
		const controls = toControls(
			toGenerator(
				element,
				"transform",
				behaviorDelay(
					performance.now(),
					(t: number) => `translate(${x()(t)}px, ${y()(t)}px)`,
				),
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
