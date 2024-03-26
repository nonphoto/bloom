import {
	Spring,
	SpringOptions,
	springCreate,
	springPosition,
	springVelocity,
} from "@chloranthy/core";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { createMemo } from "solid-js";
import { Clock } from "./time";

export type CreateSpringOptions = Partial<
	Omit<SpringOptions, "start" | "end" | "startVelocity">
>;

export function createSpring(
	target: MaybeAccessor<number | undefined>,
	options: MaybeAccessor<CreateSpringOptions>,
) {
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
