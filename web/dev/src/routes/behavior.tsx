import {
	mousePositionFromEvent,
	styleTranslate,
} from "@bloom-motion/core/src/index.js";
import {
	animate,
	createSpringBehaviorVec2,
	createVec2,
} from "@bloom-motion/solid/src/index.ts";

animate;

export default function () {
	const [mousePosition, setMousePosition] = createVec2();

	const position = createSpringBehaviorVec2(mousePosition, { halflife: 100 });

	return (
		<div
			style={{ height: "100svh" }}
			onClick={(event: MouseEvent) => {
				setMousePosition((prev) => mousePositionFromEvent(prev, event));
			}}
		>
			<div
				style={{
					position: "fixed",
					inset: "0 auto auto 0",
					width: "100px",
					height: "100px",
					background: "skyblue",
				}}
				use:animate={{
					transform: (t) => styleTranslate(position(t)),
				}}
			/>
		</div>
	);
}
