import { createEventListener } from "@solid-primitives/event-listener";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { comp, iterator, Transducer } from "@thi.ng/transducers";
import { createMemo } from "solid-js";
import {
  AnimationChain,
  AnimationChainChangeEventDetail,
} from "./animationChain";
import { animations, time } from "./transducer";
import { useAnimationChains } from "./useAnimationChains";

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
            animations(elementValue, {
              fill: "none",
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
