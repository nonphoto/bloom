import {
	type Behavior,
	type Quad2d,
	type Spring,
	type SpringOptions,
	type Vec2,
	catchMaybe,
	maybe,
	quad2dCreate,
	quad2dFromPositionSizeRotationValues,
	springBehavior,
	springCreate,
	springPosition,
	springVelocity,
	vec2Create,
	vec2Set,
	withValue,
} from "@chloranthy/core";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";
import { Clock } from "./time";

export type CreateSpringOptions = Partial<
	Omit<SpringOptions, "start" | "end" | "startVelocity">
>;

export function createSpring(
	target: MaybeAccessor<number | undefined>,
	options: MaybeAccessor<CreateSpringOptions>,
): Accessor<Spring | undefined> {
	const clock = new Clock();
	return createMemo<Spring | undefined>((prev) => {
		clock.tick();
		const end = access(target);
		return end
			? prev
				? springCreate({
						...access(options),
						start: springPosition(prev, clock.deltaTime),
						startVelocity: springVelocity(prev, clock.deltaTime),
						end,
				  })
				: springCreate({ ...access(options), end })
			: undefined;
	});
}

export function createSpringBehavior(
	target: MaybeAccessor<number | undefined>,
	options: CreateSpringOptions,
): Behavior<number | undefined> {
	const spring = createSpring(target, options);
	const memo = createMemo(catchMaybe(() => springBehavior(maybe(spring()))));
	return (t?: number) => memo()?.(t);
}

export function createSpringBehaviorVec2(
	target: MaybeAccessor<Vec2 | undefined>,
	options: CreateSpringOptions,
): Behavior<Vec2 | undefined> {
	const x = createSpringBehavior(() => access(target)?.[0], options);
	const y = createSpringBehavior(() => access(target)?.[1], options);
	return (t) => catchMaybe(
		withValue(
			vec2Create(), 
			(value, t: number) => vec2Set(value, maybe(x(t)), maybe(y(t))),
		),
	)(t!);
}

export function createSpringBehaviorQuad2d(
	target: MaybeAccessor<Quad2d | undefined>,
	options: CreateSpringOptions,
): Behavior<Quad2d | undefined> {
	const x = createSpringBehavior(() => access(target)?.k[0], options);
	const y = createSpringBehavior(() => access(target)?.k[1], options);
	const w = createSpringBehavior(() => access(target)?.ij[0], options);
	const h = createSpringBehavior(() => access(target)?.ij[3], options);
	const r = createSpringBehavior(
		catchMaybe(() =>
			Math.atan2(maybe(access(target)).ij[1], maybe(access(target)).ij[2]),
		),
		options,
	);
	return (t) => catchMaybe(
		withValue(quad2dCreate(), (value, t: number) =>
			quad2dFromPositionSizeRotationValues(
				value,
				maybe(x(t)),
				maybe(y(t)),
				maybe(w(t)),
				maybe(h(t)),
				maybe(r(t)),
			),
		),
	)(t!);
}
