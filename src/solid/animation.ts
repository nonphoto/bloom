import { access, MaybeAccessor } from "@solid-primitives/utils";
import { comp, Transducer } from "@thi.ng/transducers";
import { createMemo, createSignal, untrack } from "solid-js";
import { animation, run } from "../behavior";

export function createAnimation(
  element: MaybeAccessor<Element | undefined>,
  keyframes: MaybeAccessor<Transducer<number, Keyframe> | undefined>,
  timeline?: MaybeAccessor<AnimationTimeline | undefined>,
) {
  const [current, setCurrent] = createSignal<Animation>();
  const memo = createMemo(() => {
    untrack(current)?.cancel();
    const keyframesValue = access(keyframes);
    const elementValue = access(element);
    if (keyframesValue && elementValue) {
      return run(
        comp(
          keyframesValue,
          animation(elementValue, { fill: "both", timeline: access(timeline) }),
        ),
        setCurrent,
      ).catch((error) => {
        if (error.name !== "AbortError") {
          throw error;
        }
      });
    }
  });
  return [memo, current];
}
