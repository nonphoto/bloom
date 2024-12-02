import { Rect } from "@thi.ng/geom";
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

export type RectObserverEntry = {
  target: HTMLElement;
  rect: Rect;
};

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
  ) {
    let transforms = new WeakMap<HTMLElement, string>();
    let animations = new SetWeakMap<HTMLElement, Animation>();

    this.#batcher.addEventListener(
      "prerun",
      () => {
        walkDescendants(root, (element) => {
          transforms.set(element, element.style.transform);
          element.style.transform = "";
          for (const animation of element.getAnimations()) {
            if (animation.playState !== "finished") {
              animations.add(element, animation);
            }
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

          for (const animation of animations.get(element) ?? []) {
            animation.play();
          }
        });

        callback(this.#entries);

        this.#entries = [];
        transforms = new WeakMap();
        animations = new SetWeakMap();
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

  async getRect(element: HTMLElement) {
    return new Promise((resolve) => {
      let rect: Rect;
      this.#batcher.addEventListener("postrun", resolve, {
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
