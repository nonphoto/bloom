import { ReactiveMap } from "@solid-primitives/map";
import { createSingletonRoot } from "@solid-primitives/rootless";
import { AnimationChain } from "./animationChain";

export const useAnimationChains = createSingletonRoot(() => {
  return new ReactiveMap<Animation, AnimationChain>();
});
