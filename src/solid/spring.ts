import { fromValues, positionAt, setValues, Spring } from "@nonphoto/spring";
import {
  fromValues2,
  positionAt2,
  setValues2,
  VectorSpring,
  velocityAt2,
} from "@nonphoto/spring-vector";
import { velocityAt } from "@nonphoto/spring/src/spring.js";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { Accessor, createMemo } from "solid-js";
import { springPosition2 } from "../behavior";
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

export function createSpring2(
  position?: MaybeAccessor<Vec | undefined>,
  velocity?: MaybeAccessor<Vec | undefined>,
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    return prev
      ? setValues2(
          prev,
          positionAt2(prev[0], ...prev, clock.deltaTime),
          velocityAt2(prev[1], ...prev, clock.deltaTime),
          access(target),
          access(damping),
          access(criticality),
        )
      : fromValues2(
          access(position),
          access(velocity),
          access(target),
          access(damping),
          access(criticality),
        );
  });
}

export function createSpringPosition2(
  s: Accessor<VectorSpring>,
  epsilon?: number,
): Accessor<Transducer<number, Vec>> {
  return createMemo(() => springPosition2(s(), epsilon));
}
