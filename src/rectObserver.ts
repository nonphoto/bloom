import { createResizeObserver } from "@solid-primitives/resize-observer";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import { Accessor, createSignal } from "solid-js";
import { AnimationChain } from "./animationChain";
import { Batcher } from "./batcher";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect/fromDOMRect";
import { SetWeakMap } from "./setWeakMap";
import { createEventListener } from "@solid-primitives/event-listener";
import { useAnimationChains } from "./useAnimationChains";

export function getRect(element: HTMLElement): Rect {
  const r = element.getBoundingClientRect();
  walkAncestors(element, (ancestor) => {
    r.x += ancestor.scrollLeft;
    r.y += ancestor.scrollTop;
  });
  return rectFromDOMRect(r);
}

export type BeforeGetRectReturn = {
  transforms: WeakMap<HTMLElement, string>;
  animationChains: SetWeakMap<HTMLElement, AnimationChain>;
};

export type BeforeGetRectOptions = {
  getAnimationChain?: (animation: Animation) => AnimationChain | undefined;
};

export function beforeGetRect(
  root: HTMLElement,
  getAnimationChain: (animation: Animation) => AnimationChain | undefined,
): BeforeGetRectReturn {
  const transforms = new WeakMap<HTMLElement, string>();
  const animationChains = new SetWeakMap<HTMLElement, AnimationChain>();

  walkDescendants(root, (element) => {
    transforms.set(element, element.style.transform);
    element.style.transform = "";
    for (const animation of element.getAnimations()) {
      const animationChain = getAnimationChain(animation);
      if (animationChain) {
        animationChain.interrupt();
        animationChains.add(element, animationChain);
      }
    }
  });

  return { transforms, animationChains };
}

export function afterGetRect(
  root: HTMLElement,
  { transforms, animationChains }: BeforeGetRectReturn,
) {
  walkDescendants(root, (element) => {
    const transform = transforms.get(element);
    if (transform) {
      element.style.transform = transform;
    }
    for (const animationChain of animationChains.get(element) ?? []) {
      animationChain.resume();
    }
  });
}

export function createBatchedGetRect(root: HTMLElement) {
  const batcher = new Batcher();
  let beforeGetRectReturn: BeforeGetRectReturn | undefined;

  // TODO: Remove global animation chains
  const animationChains = useAnimationChains();

  createEventListener(batcher, "pre-enqueue", () => {
    performance.mark("batcher pre-enqueue");
    beforeGetRectReturn = beforeGetRect(root, (element) =>
      animationChains.get(element),
    );
  });

  createEventListener(batcher, "post-run", () => {
    performance.mark("batcher post-run");
    if (beforeGetRectReturn) {
      afterGetRect(root, beforeGetRectReturn);
      beforeGetRectReturn = undefined;
    }
  });

  return (element: HTMLElement) => {
    performance.mark("getRect");
    return new Promise<Rect>((resolve) => {
      batcher.enqueue(() => {
        resolve(getRect(element));
      });
    });
  };
}

export function createRect(
  getRect: (element: HTMLElement) => Promise<Rect>,
  element: MaybeAccessor<HTMLElement | undefined>,
): Accessor<Rect | undefined> {
  const [rect, setRect] = createSignal<Rect | undefined>();
  createResizeObserver(element, (_, entryElement) => {
    if (entryElement === access(element)) {
      getRect(entryElement).then(setRect);
    }
  });
  return rect;
}
