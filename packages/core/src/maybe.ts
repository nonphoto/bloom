export class MaybeError extends Error {}

export function maybe<T>(value: T | undefined) {
	if (value) {
		return value;
	} else {
		throw new MaybeError();
	}
}

export function catchMaybe<F extends (...args: any[]) => any>(
	fn: F,
): (...args: Parameters<F>) => ReturnType<F> | undefined {
	return (...args) => {
		try {
			return fn(...args);
		} catch (error) {
			if (error instanceof MaybeError) {
				return undefined;
			} else {
				throw error;
			}
		}
	};
}
