import { IndexedCollection } from "./common";
import { Mat2d, ReadonlyMat2d } from "./mat2d";
import { Rect } from "./rect";
import { ReadonlyVec2 } from "./vec2";
import { ReadonlyVec3 } from "./vec3";

function join(
	collection: IndexedCollection,
	length: number,
	unit: string,
	separator: string,
): string {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += String(collection[i]) + unit;
		if (i !== length - 1) {
			result += separator;
		}
	}
	return result;
}

export function styleTransformMat2d(transform: ReadonlyMat2d): string {
	return `matrix(${join(transform, 6, "", ",")})`;
}

export function styleTranslate(translation: ReadonlyVec2): string {
	return `translate(${join(translation, 2, "px", ",")})`;
}

export function styleTranslateScale(
	translation: ReadonlyVec2,
	scaling: ReadonlyVec2,
): string {
	return `translate(${join(translation, 2, "px", ",")}) scale(${join(scaling, 2, "", ",")})`;
}

export function styleTranslate3d(translation: ReadonlyVec3): string {
	return `translate3d(${join(translation, 3, "px", ",")})`;
}

export function styleBorderRadiusSize(
	radius: number,
	size: ReadonlyVec2,
	transform: ReadonlyMat2d,
) {
	const x = (radius / (size[0] * transform[0])) * 100;
	const y = (radius / (size[1] * transform[3])) * 100;
	return `${x}% / ${y}%`;
}

export function styleBorderRadiusRect(
	radius: number,
	rect?: Rect,
	transform?: Mat2d,
) {
	if (rect) {
		const x = (radius / (rect.width * (transform?.[0] ?? 1))) * 100;
		const y = (radius / (rect.height * (transform?.[3] ?? 1))) * 100;
		return `${x}% / ${y}%`;
	} else {
		return `${radius}px`;
	}
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
