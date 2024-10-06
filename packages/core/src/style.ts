import { Mat } from "@thi.ng/matrices";
import { Vec, Vec2Like, Vec3Like } from "@thi.ng/vectors";

function join(v: Vec | Mat, unit: string, separator: string): string {
	let result = "";
	for (let i = 0; i < v.length; i++) {
		result += String(v[i]) + unit;
		if (i < v.length - 1) {
			result += separator;
		}
	}
	return result;
}

export function styleTransformMat2d(transform: Mat): string {
	return `matrix(${join(transform, "", ",")})`;
}

export function styleTranslate(translation: Vec2Like): string {
	return `translate(${join(translation, "px", ",")})`;
}

export function styleTranslateX(x: number): string {
	return `translateX(${x}px)`;
}

export function styleTranslateY(y: number): string {
	return `translateY(${y}px)`;
}

export function styleTranslateScale(
	translation: Vec2Like,
	scaling: Vec2Like,
): string {
	return `translate(${join(translation, "px", ",")}) scale(${join(scaling, "", ",")})`;
}

export function styleTranslate3d(translation: Vec3Like): string {
	return `translate3d(${join(translation, "px", ",")})`;
}

export function styleBorderRadius(radius: number, size: Vec, transform: Mat) {
	const x = (radius / ((size[0] ?? 0) * (transform[0] ?? 1))) * 100;
	const y = (radius / ((size[1] ?? 0) * (transform[3] ?? 1))) * 100;
	return `${x}% / ${y}%`;
}

export function styleBoxShadow(
	inset: boolean,
	offsetX: number,
	offsetY: number,
	blurRadius: number,
	spreadRadius: number,
	color: string,
	transform: Mat,
) {
	const x = transform[0] ?? 1;
	const y = transform[1] ?? 1;
	const meanScale = (x + y) / 2;
	return `${inset ? "inset " : ""}${offsetX / x}px ${
		offsetY / y
	}px ${blurRadius / meanScale}px ${spreadRadius / meanScale}px ${color}`;
}
