import { Mat2d } from "./mat2d";
import { Vec2 } from "./vec2";

export function styleTransformMat2d(transform: Mat2d): string {
	let result = "matrix(";
	for (let i = 0; i < transform.length; i++) {
		result += String(transform[i]);
		if (i !== transform.length - 1) {
			result += ",";
		}
	}
	return result + ")";
}

export function styleBorderRadius(
	radius: number,
	size: Vec2,
	transform: Mat2d,
) {
	const x = (radius / (size[0] * transform[0])) * 100;
	const y = (radius / (size[1] * transform[3])) * 100;
	return `${x}% / ${y}%`;
}

export function styleBoxShadow(
	inset: boolean,
	offsetX: number,
	offsetY: number,
	blurRadius: number,
	spreadRadius: number,
	color: string,
	transform: Mat2d,
) {
	const meanScale = (transform[0] + transform[3]) / 2;
	return `${inset ? "inset " : ""}${offsetX / transform[0]}px ${
		offsetY / transform[3]
	}px ${blurRadius / meanScale}px ${spreadRadius / meanScale}px ${color}`;
}
