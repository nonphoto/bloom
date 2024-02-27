export type Range = [number, number];

export function rangeNormalize(range: Range): Range {
	return range[0] <= range[1] ? [range[0], range[1]] : [range[1], range[0]];
}

export function rangeUnion(ranges: Range[]): Range[] {
	if (ranges.length === 0) {
		return [];
	}
	ranges = ranges.map(rangeNormalize).sort((a, b) => a[0] - b[0]);
	const result = [ranges[0]!];
	for (const [start, end] of ranges.slice(1)) {
		const [lastStart, lastEnd] = result.at(-1)!;
		if (start <= lastEnd) {
			result[result.length - 1] = [lastStart, Math.max(end, lastEnd)];
		} else {
			result.push([start, end]);
		}
	}
	return result;
}

export function rangeAdd(ranges: Range[], range: Range): Range[] {
	return rangeUnion([...ranges, range]);
}
