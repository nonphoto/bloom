export function easeInQuad(x: number) {
	return x * x;
}

export function easeOutQuad(x: number) {
	return 1 - (1 - x) * (1 - x);
}

export function easeInOutQuad(x: number) {
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeInCubic(x: number) {
	return x * x * x;
}

export function easeOutCubic(x: number) {
	return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(x: number) {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeInQuart(x: number) {
	return x * x * x * x;
}

export function easeOutQuart(x: number) {
	return 1 - Math.pow(1 - x, 4);
}

export function easeInOutQuart(x: number) {
	return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

export function easeInQuint(x: number) {
	return x * x * x * x * x;
}

export function easeOutQuint(x: number) {
	return 1 - Math.pow(1 - x, 5);
}

export function easeInOutQuint(x: number) {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function easeInSine(x: number) {
	return 1 - Math.cos((x * Math.PI) / 2);
}

export function easeOutSine(x: number) {
	return Math.sin((x * Math.PI) / 2);
}

export function easeInOutSine(x: number) {
	return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeInExpo(x: number) {
	return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function easeOutExpo(x: number) {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInOutExpo(x: number) {
	return x === 0
		? 0
		: x === 1
			? 1
			: x < 0.5
				? Math.pow(2, 20 * x - 10) / 2
				: (2 - Math.pow(2, -20 * x + 10)) / 2;
}

export function easeInCirc(x: number) {
	return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export function easeOutCirc(x: number) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function easeInOutCirc(x: number) {
	return x < 0.5
		? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
		: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}
