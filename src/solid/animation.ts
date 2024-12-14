import { createEventListener } from "@solid-primitives/event-listener";
import { ReactiveMap } from "@solid-primitives/map";
import { createSingletonRoot } from "@solid-primitives/rootless";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { comp, iterator, Transducer } from "@thi.ng/transducers";
import { createMemo } from "solid-js";
import {
  AnimationChain,
  AnimationChainChangeEventDetail,
} from "../animationChain";
import { animation, time } from "../behavior";

export const useAnimationChains = createSingletonRoot(() => {
  return new ReactiveMap<Animation, AnimationChain>();
});

export function createAnimation(
  element: MaybeAccessor<Element | undefined>,
  keyframes: MaybeAccessor<Transducer<number, Keyframe> | undefined>,
  timeline?: MaybeAccessor<AnimationTimeline | undefined>,
) {
  const animationChains = useAnimationChains();
  const memo = createMemo<AnimationChain | undefined>((prev) => {
    prev?.cancel();
    const keyframesValue = access(keyframes);
    const elementValue = access(element);
    if (keyframesValue && elementValue) {
      const chain = new AnimationChain(
        iterator(
          comp(
            keyframesValue,
            animation(elementValue, {
              fill: "both",
              timeline: access(timeline),
            }),
          ),
          time(),
        ),
      );
      animationChains.set(chain.animation, chain);
      createEventListener(
        chain,
        "change",
        (event: CustomEventInit<AnimationChainChangeEventDetail>) => {
          animationChains.delete(event.detail!.prev);
          animationChains.set(event.detail!.next, chain);
        },
      );
      createEventListener(chain, "finish", () => {
        animationChains.delete(chain.animation);
      });
      chain.play();
      return chain;
    }
  });
  return memo;
}
