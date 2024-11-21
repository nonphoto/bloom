import { ReactiveMap } from "@solid-primitives/map";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { MaybeAccessor, access } from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import { Accessor, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { RectObserver, RectObserverEntry } from "../rectObserver";

interface MakeRectObserverReturn {
  invalidate(element: HTMLElement): Promise<void>;
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

export const useRectObserver =
  createHydratableSingletonRoot<UseRectObserverReturn>(() => {
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
  });

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
