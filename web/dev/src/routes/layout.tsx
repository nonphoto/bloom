import { xprod } from "ramda";
import { createSignal } from "solid-js";

const areas = xprod([1, 2, 3], [1, 2, 3]);

export default function Layout() {
	const [index, setIndex] = createSignal(0);

	return (
		<div
			style={{
				height: "100svh",
				display: "grid",
				"grid-template-columns": "3fr 2fr 1fr",
				"grid-template-rows": "3fr 2fr 1fr",
			}}
			onClick={() => {
				setIndex((index) => (index + 1) % areas.length);
			}}
		>
			<div
				style={{
					background: "pink",
					"grid-row-start": areas[index()]?.[0],
					"grid-column-start": areas[index()]?.[1],
				}}
				// use:animate={{
				// 	transform: (element: HTMLElement) => {
				// 		const quad = useQuad(element);
				// 		const springQuad = createSpringBehaviorQuad2d(quad);
				// 		return (t) =>
				// 			styleTransformMat2d(
				// 				quad2dUntransformMat2d(quad(t), springQuad(t)),
				// 			);
				// 	},
				// }}
			/>
		</div>
	);
}
