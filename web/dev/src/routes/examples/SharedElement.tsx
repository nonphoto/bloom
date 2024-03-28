import {
	Mat2d,
	Quad2d,
	Vec2,
	catchMaybe,
	maybe,
	quad2dCover,
	quad2dCreate,
	quad2dFromPositionSize,
	quad2dFromRect,
	quad2dTransformMat2d,
	rectCenter,
	rectSize,
	vec2Create,
	withValue,
} from "@chloranthy/core";
import { borderRadius, quad, useRect } from "@chloranthy/solid";
import { xprod } from "ramda";
import { createSignal } from "solid-js";
import classes from "./SharedElement.module.css";

quad;
borderRadius;

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			quad: Quad2d | undefined;
			borderRadius: number;
		}
	}
}

const areas = xprod([1, 2, 3], [1, 2, 3]);

export default function SharedElement() {
	const [areaIndex, setAreaIndex] = createSignal(0);

	const [outerElement, setOuterElement] = createSignal<
		HTMLElement | undefined
	>();
	const [innerElement, setInnerElement] = createSignal<
		HTMLElement | undefined
	>();

	const outerTargetRect = useRect(outerElement);
	const innerTargetRect = useRect(innerElement);

	const targetPosition = catchMaybe(
		withValue(vec2Create(), (value) =>
			rectCenter(value, maybe(outerTargetRect())),
		),
	);
	const targetSize = catchMaybe(
		withValue(vec2Create(), (value) =>
			rectSize(value, maybe(outerTargetRect())),
		),
	);
	const position = createSpring2(targetPosition, { halflife: 150 });
	const size = createSpring2(targetSize, { halflife: 300 });
	const quad = withValue(quad2dCreate(), (value) =>
		quad2dFromPositionSize(value, position(), size()),
	);

	const outerMatrix = layoutModel.useMatrix(outerElement);

	const outerQuad = createMaybeMemo(
		(out: Quad2d, position: Vec2, size: Vec2, matrix: Mat2d) => {
			quad2dFromPositionSize(out, position, size);
			quad2dTransformMat2d(out, out, matrix);
			return out;
		},
		quad2dCreate,
		() => position().p,
		() => size().p,
		outerMatrix, // this is only for scroll in this example
	);

	const innerTargetQuad = createMaybeMemo(
		quad2dFromRect,
		quad2dCreate,
		innerTargetRect,
	);

	const innerQuad = createMaybeMemo(
		quad2dCover,
		quad2dCreate,
		innerTargetQuad,
		outerQuad,
	);

	return (
		<>
			<div
				class={classes.grid}
				onClick={() => {
					setAreaIndex((index) => (index + 1) % areas.length);
				}}
			>
				<div
					class={classes.shadow}
					style={{
						"grid-row-start": areas[areaIndex()]?.[0],
						"grid-column-start": areas[areaIndex()]?.[1],
					}}
				>
					<div
						ref={setOuterElement}
						class={classes.outer}
						use:quad={outerQuad()} // use:quad does not make sense, quads are only relative to view but we need better scoping
						use:borderRadius={50}
						id="outer"
					>
						<div
							ref={setInnerElement}
							class={classes.inner}
							use:quad={innerQuad()}
							use:borderRadius={50}
						></div>
					</div>
				</div>
			</div>
			<div style={{ height: "100vh" }}></div>
		</>
	);
}
