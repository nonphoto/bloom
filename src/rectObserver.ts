import { createResizeObserver } from "@solid-primitives/resize-observer";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Rect } from "@thi.ng/geom";
import { Accessor, createSignal } from "solid-js";
import { Batcher } from "./batcher";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect/fromDOMRect";
import { createEventListener } from "@solid-primitives/event-listener";

export function getRect(element: HTMLElement): Rect {
  const r = element.getBoundingClientRect();
  walkAncestors(element, (ancestor) => {
    r.x += ancestor.scrollLeft;
    r.y += ancestor.scrollTop;
  });
  return rectFromDOMRect(r);
}

export type BeforeGetRectReturn = {
  root: HTMLElement;
  transforms: WeakMap<HTMLElement, string>;
};

export function beforeGetRect(root: HTMLElement): BeforeGetRectReturn {
  const transforms = new WeakMap<HTMLElement, string>();

  walkDescendants(root, (element) => {
    transforms.set(element, element.style.transform);
    element.style.transform = "";
  });

  return { root, transforms };
}

export function afterGetRect({ root, transforms }: BeforeGetRectReturn) {
  walkDescendants(root, (element) => {
    const transform = transforms.get(element);
    if (transform) {
      element.style.transform = transform;
    }
  });
}

export function createBatchedGetRect(root: MaybeAccessor<HTMLElement>) {
  const batcher = new Batcher();
  let beforeGetRectReturn: BeforeGetRectReturn | undefined;

  createEventListener(batcher, "pre-enqueue", () => {
    performance.mark("batcher pre-enqueue");
    beforeGetRectReturn = beforeGetRect(access(root));
  });

  createEventListener(batcher, "post-run", () => {
    performance.mark("batcher post-run");
    if (beforeGetRectReturn) {
      afterGetRect(beforeGetRectReturn);
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
