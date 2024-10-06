import { fromValues, positionAt, setValues, Spring } from "@nonphoto/spring";
import { velocityAt } from "@nonphoto/spring/src/spring.js";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";
import { Clock } from "./time";

export function createSpring(
	position?: MaybeAccessor<number | undefined>,
	velocity?: MaybeAccessor<number | undefined>,
	target?: MaybeAccessor<number | undefined>,
	damping?: MaybeAccessor<number | undefined>,
	criticality?: MaybeAccessor<number | undefined>,
): Accessor<Spring> {
	const clock = new Clock();
	return createMemo((prev) => {
		clock.tick();
		return prev
			? setValues(
					prev,
					positionAt(...prev, clock.deltaTime),
					velocityAt(...prev, clock.deltaTime),
					access(target),
					access(damping),
					access(criticality),
				)
			: fromValues(
					access(position),
					access(velocity),
					access(target),
					access(damping),
					access(criticality),
				);
	});
}
