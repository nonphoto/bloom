import { Mat } from "@thi.ng/matrices";
import { Transducer } from "@thi.ng/transducers";
import { Batcher } from "./batcher";
import { Rect } from "@thi.ng/geom";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect/fromDOMRect";
import { TransformController } from "./transformController";

export type RectControllerEntry = { target: Element; rect: Rect };

export type RectControllerCallback = (entries: RectControllerEntry[]) => void;

export class RectController {
  #targets = new Set<Element>();
  #batcher = new Batcher();
  #resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      this.invalidate(entry.target);
    }
  });
  #transforms = new WeakMap<Element, TransformController>();

  constructor(callback: RectControllerCallback) {
    this.#batcher.addEventListener("pre-enqueue", () => {
      walkDescendants(document.documentElement, (element) => {
        const transform = this.#transforms.get(element);
        transform?.disable();
      });
    });

    this.#batcher.addEventListener("run", () => {
      callback(
        Array.from(this.#targets.values()).map((target) => ({
          target,
          rect: this.#getRect(target),
        })),
      );
      this.#targets.clear();
    });

    this.#batcher.addEventListener("post-run", () => {
      walkDescendants(document.documentElement, (element) => {
        const transform = this.#transforms.get(element);
        transform?.enable();
      });
    });
  }

  #getRect(element: Element): Rect {
    const r = element.getBoundingClientRect();
    walkAncestors(element, (ancestor) => {
      r.x += ancestor.scrollLeft;
      r.y += ancestor.scrollTop;
    });
    return rectFromDOMRect(r);
  }

  observe(element: Element): void {
    this.#resizeObserver.observe(element);
  }

  unobserve(element: Element): void {
    this.#resizeObserver.unobserve(element);
  }

  invalidate(element: Element): void {
    this.#targets.add(element);
    this.#batcher.enqueue();
  }

  #getTransform(element: Element) {
    const transform =
      this.#transforms.get(element) ?? new TransformController(element);
    this.#transforms.set(element, transform);
    return transform;
  }

  animate(
    element: Element,
    transform: Transducer<number, Mat>,
  ): Animation | undefined {
    return this.#getTransform(element).animate(transform);
  }
}
