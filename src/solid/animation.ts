import { access, MaybeAccessor } from "@solid-primitives/utils";
import { comp, Transducer } from "@thi.ng/transducers";
import { Properties } from "csstype";
import { createMemo, createSignal, untrack } from "solid-js";
import { animation, keyframes, run } from "../behavior";

export function createAnimation<T extends keyof Properties>(
  element: MaybeAccessor<Element | undefined>,
  propName: MaybeAccessor<T>,
  tx: MaybeAccessor<Transducer<number, Properties[T]> | undefined>,
  timeline?: MaybeAccessor<AnimationTimeline | undefined>,
) {
  const [current, setCurrent] = createSignal<Animation>();
  const memo = createMemo(() => {
    untrack(current)?.cancel();
    const txValue = access(tx);
    const elementValue = access(element);
    if (txValue && elementValue) {
      return run(
        comp(
          txValue as Transducer<number, any>,
          keyframes(access(propName)),
          animation(elementValue, { timeline: access(timeline) }),
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
