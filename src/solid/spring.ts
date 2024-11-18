import { fromValues, positionAt, setValues, Spring } from "@nonphoto/spring";
import {
  fromValues2,
  fromValues3,
  fromValues4,
  positionAt2,
  positionAt3,
  positionAt4,
  setValues2,
  setValues3,
  setValues4,
  VectorSpring,
  velocityAt2,
  velocityAt3,
  velocityAt4,
} from "@nonphoto/spring-vector";
import { velocityAt } from "@nonphoto/spring/src/spring.js";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import { Vec } from "@thi.ng/vectors";
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
  return createMemo(
    (prev) => {
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
    },
    undefined,
    { equals: false },
  );
}

export function createSpring2(
  position?: MaybeAccessor<Vec | undefined>,
  velocity?: MaybeAccessor<Vec | undefined>,
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo(
    (prev) => {
      clock.tick();
      return prev
        ? setValues2(
            prev,
            positionAt2([], ...prev, clock.deltaTime),
            velocityAt2([], ...prev, clock.deltaTime),
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
    },
    undefined,
    { equals: false },
  );
}

export function createSpring3(
  position?: MaybeAccessor<Vec | undefined>,
  velocity?: MaybeAccessor<Vec | undefined>,
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo(
    (prev) => {
      clock.tick();
      return prev
        ? setValues3(
            prev,
            positionAt3([], ...prev, clock.deltaTime),
            velocityAt3([], ...prev, clock.deltaTime),
            access(target),
            access(damping),
            access(criticality),
          )
        : fromValues3(
            access(position),
            access(velocity),
            access(target),
            access(damping),
            access(criticality),
          );
    },
    undefined,
    { equals: false },
  );
}

export function createSpring4(
  position?: MaybeAccessor<Vec | undefined>,
  velocity?: MaybeAccessor<Vec | undefined>,
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo(
    (prev) => {
      clock.tick();
      return prev
        ? setValues4(
            prev,
            positionAt4([], ...prev, clock.deltaTime),
            velocityAt4([], ...prev, clock.deltaTime),
            access(target),
            access(damping),
            access(criticality),
          )
        : fromValues4(
            access(position),
            access(velocity),
            access(target),
            access(damping),
            access(criticality),
          );
    },
    undefined,
    { equals: false },
  );
}

type RectSpring = { pos: VectorSpring; size: VectorSpring };

export function createSpringRect(
  position?: MaybeAccessor<Rect | undefined>,
  velocity?: MaybeAccessor<Rect | undefined>,
  target?: MaybeAccessor<Rect | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<RectSpring> {
  const pos = createSpring2(
    () => access(position)?.pos,
    () => access(velocity)?.pos,
    () => access(target)?.pos,
    damping,
    criticality,
  );
  const size = createSpring2(
    () => access(position)?.size,
    () => access(velocity)?.size,
    () => access(target)?.size,
    damping,
    criticality,
  );
  return () => ({ pos: pos(), size: size() });
}
