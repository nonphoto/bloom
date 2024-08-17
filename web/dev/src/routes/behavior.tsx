import {
	animation,
	keyframes,
	run,
	spring,
} from "@bloom-motion/core/src/behavior.js";
import { springCreate } from "@bloom-motion/core/src/spring.js";
import { styleTranslateX } from "@bloom-motion/core/src/style.js";
import { comp, map } from "@thi.ng/transducers";
import { createEffect } from "solid-js";

export default function () {
	let element: HTMLDivElement;

	createEffect(() => {
		run(
			comp(
				spring(springCreate({ end: 100, halflife: 1000 })),
				map(styleTranslateX),
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
