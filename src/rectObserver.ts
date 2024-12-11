import { ReactiveMap } from "@solid-primitives/map";
import { createSingletonRoot } from "@solid-primitives/rootless";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import { Accessor, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { AnimationChain } from "./animationChain";
import { Batcher } from "./batcher";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect";
import { SetWeakMap } from "./setWeakMap";

function getRect(element: HTMLElement): Rect {
  const r = element.getBoundingClientRect();
  walkAncestors(element, (ancestor) => {
    r.x += ancestor.scrollLeft;
    r.y += ancestor.scrollTop;
  });
  return rectFromDOMRect(r);
}

export interface RectObserverEntry {
  target: HTMLElement;
  rect: Rect;
}

export interface RectObserverOptions {
  getAnimationChain?: (animation: Animation) => AnimationChain | undefined;
}

export class RectObserver {
  #batcher = new Batcher();
  #entries: RectObserverEntry[] = [];
  #elements = new Set<HTMLElement>();
  #resizeObserver = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      if (target instanceof HTMLElement) {
        this.invalidate(target);
      }
    }
  });

  constructor(
    root: HTMLElement,
    callback: (entries: RectObserverEntry[]) => void,
    options?: RectObserverOptions,
  ) {
    let transforms = new WeakMap<HTMLElement, string>();
    let animationChains = new SetWeakMap<HTMLElement, AnimationChain>();
    this.#batcher.addEventListener(
      "prerun",
      () => {
        walkDescendants(root, (element) => {
          transforms.set(element, element.style.transform);
          element.style.transform = "";
          for (const animation of element.getAnimations()) {
            const animationChain =
              options?.getAnimationChain?.(animation) ??
              new AnimationChain(animation);
            animationChain.interrupt();
            animationChains.add(element, animationChain);
          }
        });
      },
      { passive: true },
    );
    this.#batcher.addEventListener(
      "postrun",
      () => {
        walkDescendants(root, (element) => {
          const transform = transforms.get(element);
          if (transform) {
            element.style.transform = transform;
          }
          for (const animationChain of animationChains.get(element) ?? []) {
            animationChain.resume();
          }
        });
        callback(this.#entries);
        this.#entries = [];
        transforms = new WeakMap();
      },
      { passive: true },
    );
  }

  invalidate(element: HTMLElement) {
    this.#batcher.enqueue(() => {
      if (this.#elements.has(element)) {
        this.#entries.push({ target: element, rect: getRect(element) });
      }
    });
  }

  async getRect(element: HTMLElement): Promise<Rect> {
    return new Promise((resolve) => {
      let rect: Rect;
      this.#batcher.addEventListener("postrun", () => void resolve(rect), {
        once: true,
        passive: true,
      });
      this.#batcher.enqueue(() => {
        rect = getRect(element);
      });
    });
  }

  observe(target: HTMLElement) {
    this.#elements.add(target);
    this.#resizeObserver.observe(target);
  }

  unobserve(target: HTMLElement) {
    this.#elements.delete(target);
    this.#resizeObserver.unobserve(target);
  }

  disconnect() {
    this.#elements.clear();
    this.#resizeObserver.disconnect();
  }
}

interface MakeRectObserverReturn {
  invalidate(element: HTMLElement): void;
  getRect(element: HTMLElement): Promise<Rect>;
  observe(target: HTMLElement): void;
  unobserve(target: HTMLElement): void;
}

interface UseRectObserverReturn extends MakeRectObserverReturn {
  rects: ReactiveMap<HTMLElement, Rect | null>;
}

export function makeRectObserver(
  callback: (entries: RectObserverEntry[]) => void,
): MakeRectObserverReturn {
  if (isServer) {
    return {
      async invalidate() {},
      async getRect() {
        return new Promise<Rect>(() => {});
      },
      observe() {},
      unobserve() {},
    };
  } else {
    const observer = new RectObserver(document.documentElement, callback);
    onCleanup(() => {
      observer.disconnect();
    });
    return {
      invalidate: observer.invalidate.bind(observer),
      getRect: observer.getRect.bind(observer),
      observe: observer.observe.bind(observer),
      unobserve: observer.unobserve.bind(observer),
    };
  }
}

export const useRectObserver = createSingletonRoot<UseRectObserverReturn>(
  () => {
    const rects = new ReactiveMap<HTMLElement, Rect | null>();
    const observer = makeRectObserver((entries) => {
      for (const { target, rect } of entries) {
        if (rects.has(target)) {
          rects.set(target, rect);
        }
      }
    });
    return {
      rects,
      ...observer,
    };
  },
);

export function createRect(
  element: MaybeAccessor<HTMLElement | undefined>,
): Accessor<Rect | undefined> {
  const { rects, observe, unobserve } = useRectObserver();
  createEffect(() => {
    const elementValue = access(element);
    if (elementValue) {
      rects.set(elementValue, null);
      observe(elementValue);
      onCleanup(() => {
        rects.delete(elementValue);
        unobserve(elementValue);
      });
    }
  });
  return () => {
    const elementValue = access(element);
    return elementValue ? (rects.get(elementValue) ?? undefined) : undefined;
  };
}
