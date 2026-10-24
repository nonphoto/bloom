import { ReactiveMap } from "@solid-primitives/map";
import { createSingletonRoot } from "@solid-primitives/rootless";
import {
  Many,
  MaybeAccessor,
  access,
  asArray,
  filterNonNullable,
  handleDiffArray,
} from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import {
  Accessor,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";
import { isServer } from "@solidjs/web";
import { AnimationChain } from "./animationChain";
import { Batcher } from "./batcher";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect/fromDOMRect";
import { SetWeakMap } from "./setWeakMap";
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
  options?: BeforeGetRectOptions,
): BeforeGetRectReturn {
  const transforms = new WeakMap<HTMLElement, string>();
  const animationChains = new SetWeakMap<HTMLElement, AnimationChain>();

  walkDescendants(root, (element) => {
    transforms.set(element, element.style.transform);
    element.style.transform = "";
    for (const animation of element.getAnimations()) {
      const animationChain = options?.getAnimationChain?.(animation);
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

export interface RectObserverEntry {
  target: HTMLElement;
  rect: Rect;
}

export interface RectObserverOptions {
  getAnimationChain?: (animation: Animation) => AnimationChain | undefined;
}

export type RectObserverCallback = (entries: RectObserverEntry[]) => void;

export class RectObserver {
  #batcher = new Batcher();
  #entries: RectObserverEntry[] = [];
  #resizeObserver = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      if (target instanceof HTMLElement) {
        this.invalidate(target);
      }
    }
  });

  constructor(
    root: HTMLElement,
    callback: RectObserverCallback,
    options?: RectObserverOptions,
  ) {
    let beforeGetRectReturn: BeforeGetRectReturn | null = null;
    this.#batcher.addEventListener(
      "first-enqueue",
      () => {
        console.log("first-enqueue");
        beforeGetRectReturn = beforeGetRect(root, options);
      },
      { passive: true },
    );
    this.#batcher.addEventListener(
      "postrun",
      () => {
        console.log("postrun");
        if (beforeGetRectReturn) {
          afterGetRect(root, beforeGetRectReturn);
        }
        beforeGetRectReturn = null;
        callback(this.#entries);
        this.#entries = [];
      },
      { passive: true },
    );
  }

  invalidate(element: HTMLElement) {
    console.log("invalidate", element);
    this.#batcher.enqueue(() => {
      this.#entries.push({ target: element, rect: getRect(element) });
    });
  }

  observe(target: HTMLElement) {
    this.#resizeObserver.observe(target);
  }

  unobserve(target: HTMLElement) {
    this.#resizeObserver.unobserve(target);
  }

  disconnect() {
    this.#resizeObserver.disconnect();
  }
}

interface MakeRectObserverReturn {
  invalidate(element: HTMLElement): void;
  observe(target: HTMLElement): void;
  unobserve(target: HTMLElement): void;
}

export function makeRectObserver(
  callback: RectObserverCallback,
  options?: RectObserverOptions,
): MakeRectObserverReturn {
  if (isServer) {
    return {
      invalidate() {},
      observe() {},
      unobserve() {},
    };
  } else {
    const observer = new RectObserver(
      document.documentElement,
      callback,
      options,
    );
    onCleanup(() => {
      observer.disconnect();
    });
    return {
      invalidate: observer.invalidate.bind(observer),
      observe: observer.observe.bind(observer),
      unobserve: observer.unobserve.bind(observer),
    };
  }
}

export type CreateRectObserverCallback = (entry: RectObserverEntry) => void;

export function createRectObserver(
  targets: MaybeAccessor<Many<HTMLElement | undefined | null>>,
  callback: CreateRectObserverCallback,
  options?: RectObserverOptions,
): void {
  if (isServer) return;
  const observer = makeRectObserver((entries) => {
    for (const entry of entries) {
      callback(entry);
    }
  }, options);

  createEffect(
    () => filterNonNullable(asArray(access(targets))),
    (targets, prevTargets = []) => {
      handleDiffArray(
        targets,
        prevTargets,
        (element) => {
          console.log("add element", element);
          observer.observe(element);
        },
        observer.unobserve,
      );
    },
  );
}

export interface UseRectObserverReturn {
  useCallback(
    element: MaybeAccessor<HTMLElement | undefined>,
    callback: CreateRectObserverCallback,
  ): void;
}

export const useRectObserver = createSingletonRoot<UseRectObserverReturn>(
  () => {
    const animationChains = useAnimationChains();

    // TODO: Replace these with a better data structure
    const callbacks = new SetWeakMap<HTMLElement, CreateRectObserverCallback>();
    const elements = new ReactiveMap<string, HTMLElement>();

    createRectObserver(
      () => [...elements.values()],
      (entry) => {
        for (const callback of callbacks.get(entry.target) ?? []) {
          callback(entry);
        }
      },
      { getAnimationChain: (animation) => animationChains.get(animation) },
    );

    return {
      useCallback: (element, callback) => {
        const id = createUniqueId();
        createEffect(
          () => access(element),
          (element) => {
            if (element) {
              elements.set(id, element);
              callbacks.add(element, callback);
              return () => {
                callbacks.remove(element, callback);
              };
            } else {
              elements.delete(id);
            }
          },
        );
      },
    };
  },
);

export function createRect(
  element: MaybeAccessor<HTMLElement | undefined>,
): Accessor<Rect | undefined> {
  const [rect, setRect] = createSignal<Rect | undefined>();
  useRectObserver().useCallback(element, ({ rect }) => {
    setRect(rect);
  });
  return rect;
}
