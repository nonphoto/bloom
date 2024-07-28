import {
	mousePositionFromEvent,
	styleTranslate,
} from "@bloom-motion/core/src/index.js";
import {
	createAnimation,
	createSpringBehaviorVec2,
	createVec2,
} from "@bloom-motion/solid/src/index.ts";

export default function () {
	const [mousePosition, setMousePosition] = createVec2();

	const element = (
		<div
			style={{
				position: "fixed",
				inset: "0 auto auto 0",
				width: "100px",
				height: "100px",
				background: "skyblue",
			}}
		/>
	) as Element;

	const position = createSpringBehaviorVec2(mousePosition, { halflife: 100 });

	createAnimation(element, "transform", (t) => styleTranslate(position(t)));

	return (
		<div
			style={{ height: "100svh" }}
			onClick={(event: MouseEvent) => {
				setMousePosition((prev) => mousePositionFromEvent(prev, event));
			}}
		>
			{element}
		</div>
	);
}
