import { Mat } from "@thi.ng/matrices";
import { Vec } from "@thi.ng/vectors";

function join(
  v: Vec | Mat,
  length: number,
  unit: string,
  separator: string,
): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += String(v[i] ?? 0) + unit;
    if (i < length - 1) {
      result += separator;
    }
  }
  return result;
}

export function styleTransformMat23(transform: Mat): string;
export function styleTransformMat23(transform?: Mat): string | undefined;
export function styleTransformMat23(transform?: Mat): string | undefined {
  return transform ? `matrix(${join(transform, 6, "", ",")})` : undefined;
}

export function styleTransformMat33(transform: Mat): string;
export function styleTransformMat33(transform?: Mat): string | undefined;
export function styleTransformMat33(transform?: Mat): string | undefined {
  if (transform) {
    const [m00, m01, , m10, m11, , m20, m21] = transform;
    return `matrix(${join([m00, m01, m10, m11, m20, m21], 6, "", ",")})`;
  }
}

export function styleTranslate(translation: Vec): string;
export function styleTranslate(translation?: Vec): string | undefined;
export function styleTranslate(translation?: Vec): string | undefined {
  return translation
    ? `translate(${join(translation, 2, "px", ",")})`
    : undefined;
}

export function styleTranslateX(x: number): string;
export function styleTranslateX(x?: number): string | undefined;
export function styleTranslateX(x?: number): string | undefined {
  return x != null ? `translateX(${x}px)` : undefined;
}

export function styleTranslateY(y: number): string;
export function styleTranslateY(y?: number): string | undefined;
export function styleTranslateY(y?: number): string | undefined {
  return y != null ? `translateY(${y}px)` : undefined;
}

export function styleTranslateScale(translation: Vec, scaling: Vec): string {
  return `translate(${join(translation, 2, "px", ",")}) scale(${join(scaling, 2, "", ",")})`;
}

export function styleTranslate3d(translation: Vec): string {
  return `translate3d(${join(translation, 3, "px", ",")})`;
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
