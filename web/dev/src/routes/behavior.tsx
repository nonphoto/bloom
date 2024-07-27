import {
	Vec2,
	vec2Create,
	vec2FromValues,
} from "@bloom-motion/core/src/vec2.js";
import {
	createAnimation,
	createSpringBehaviorVec2,
} from "@bloom-motion/solid/src/index.ts";
import { createSignal } from "solid-js";

function styleTranslate(v: Vec2): string {
	return `translate(${v[0]}px, ${v[1]}px)`;
}

export default function () {
	const [mousePosition, setMousePosition] = createSignal(vec2Create(), {
		equals: false,
	});

	const element = (
		<div
			style={{
				position: "fixed",
				inset: "0 auto auto 0",
				width: "100px",
				height: "100px",
				background: "skyblue",
			}}
		></div>
	) as Element;

	const position = createSpringBehaviorVec2(mousePosition, { halflife: 100 });

	createAnimation(element, "transform", (t) => styleTranslate(position(t)));

	return (
		<div
			style={{ height: "100svh" }}
			onClick={(event: MouseEvent) => {
				setMousePosition(vec2FromValues(event.clientX, event.clientY));
			}}
		>
			{element}
		</div>
	);
}
