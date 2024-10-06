import {
	animation,
	keyframes,
	run,
	tuples,
} from "@bloom-motion/core/src/behavior.js";
import {
	springPosition,
	styleTranslate,
} from "@bloom-motion/core/src/index.js";
import { fromValues, halflifeToDamping } from "@nonphoto/spring";
import { comp, map } from "@thi.ng/transducers";
import { createEffect } from "solid-js";

export default function () {
	let element: HTMLDivElement;

	createEffect(() => {
		run(
			comp(
				tuples(
					springPosition(fromValues(0, 0, 100, halflifeToDamping(100))),
					springPosition(fromValues(0, 0, 200, halflifeToDamping(200))),
				),
				map(styleTranslate),
				keyframes("transform"),
				animation(element),
			),
			console.log,
		).then(console.log);
	});

	return (
		<div style={{ height: "100svh" }}>
			<div
				ref={element!}
				style={{
					position: "fixed",
					inset: "0 auto auto 0",
					width: "100px",
					height: "100px",
					background: "skyblue",
				}}
			/>
			<div
				ref={(element) => {
					element.animate(
						{ transform: [`translateX(0px)`, `translateX(99px)`] },
						{ duration: (1_000 / 60) * 100 },
					);
				}}
				style={{
					position: "fixed",
					inset: "100px auto auto 0",
					width: "100px",
					height: "100px",
					background: "pink",
				}}
			/>
		</div>
	);
}
