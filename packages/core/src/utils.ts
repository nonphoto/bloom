const maybeError = new Error();

export function maybe<T>(value: T | undefined): T {
	if (value != null) {
		return value;
	} else {
		throw maybeError;
	}
}

export function catchMaybe<T extends any[], U>(
	fn: (...args: T) => U,
): (...args: T) => U | undefined {
	return (...args) => {
		try {
			return fn(...args);
		} catch (error) {
			if (error === maybeError) {
				return undefined;
			} else {
				throw error;
			}
		}
	};
}

export function withValue<T, U extends unknown[], V>(
	value: T,
	fn: (value: T, ...args: U) => V,
): (...args: U) => V {
	return (...args) => fn(value, ...args);
}
