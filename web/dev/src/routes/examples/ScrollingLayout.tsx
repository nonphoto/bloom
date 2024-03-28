import {
	Mat2d,
	Quad2d,
	mat2dCreate,
	mat2dFromRotation,
	quad2dCreate,
	quad2dFromRect,
	quad2dTransformMat2d,
} from "@chloranthy/core";
import { quad, setTransform, useMatrix, useRect } from "@chloranthy/solid";
import { createRAF } from "@solid-primitives/raf";
import { createEffect, createMemo, createSignal } from "solid-js";
import classes from "./ScrollingLayout.module.css";

quad;
setTransform;

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			setTransform: Mat2d | undefined;
			quad: Quad2d | undefined;
		}
	}
}

export default function ScrollingLayout() {
	const [parentTransform, setParentTransform] = createSignal<Mat2d>(
		mat2dCreate(),
		{
			equals: false,
		},
	);

	const [innerElement, setInnerElement] = createSignal<HTMLElement>();

	const [, start] = createRAF(function raf(t) {
		setParentTransform((prev) => mat2dFromRotation(prev, t * 0.001));
	});

	createEffect(() => {
		start();
	});

	const innerRect = useRect(innerElement);
	const innerMatrix = useMatrix(innerElement);

	const shadowQuad = createMemo<Quad2d>(
		(out) => {
			const innerRectValue = innerRect();
			const innerMatrixValue = innerMatrix();
			if (innerRectValue && innerMatrixValue) {
				quad2dFromRect(out, innerRectValue);
				quad2dTransformMat2d(out, out, innerMatrixValue);
			}
			return out;
		},
		quad2dCreate(),
		{ equals: false },
	);

	return (
		<>
			<div
				id="test"
				class={`${classes.container} ${classes.outer}`}
				use:setTransform={parentTransform()}
			>
				<div class={classes.container}>
					<div class={classes.sticky}></div>
					<div class={classes.absolute} ref={setInnerElement}></div>
				</div>
			</div>
			<div class={classes.shadow} use:quad={shadowQuad()} />
		</>
	);
}
