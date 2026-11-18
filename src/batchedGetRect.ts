import { Batcher } from "./batcher";
import { walkAncestors } from "./dom";
import { Rect } from "@thi.ng/geom";
import { rectFromDOMRect } from "./rect/fromDOMRect";

export type BatchedGetRectEntry = { target: Element; rect: Rect };

export type BatchedGetRectCallback = (entries: BatchedGetRectEntry[]) => void;

export type BatchedGetRectReturn = (element: Element) => void;

export function batchedGetRect(
  callback: BatchedGetRectCallback,
): BatchedGetRectReturn {
  const batcher = new Batcher();
  const targets = new Set<Element>();

  const style = document.createElement("style");
  style.innerHTML = "* {transform: none !important}";

  const getRect = (element: Element): Rect => {
    const r = element.getBoundingClientRect();
    walkAncestors(element, (ancestor) => {
      r.x += ancestor.scrollLeft;
      r.y += ancestor.scrollTop;
    });
    return rectFromDOMRect(r);
  };

  batcher.addEventListener("pre-enqueue", () => {
    document.body.appendChild(style);
  });

  batcher.addEventListener("run", () => {
    callback(
      Array.from(targets.values()).map((target) => ({
        target,
        rect: getRect(target),
      })),
    );
    targets.clear();
  });

  batcher.addEventListener("post-run", () => {
    document.body.removeChild(style);
  });

  return (element) => {
    targets.add(element);
    batcher.enqueue();
  };
}
