import { walkAncestors } from "./dom";
import { Rect } from "@thi.ng/geom";
import { rectFromDOMRect } from "./rect/fromDOMRect";
import { batched } from "./batched";

export type BatchedGetRectEntry = { target: Element; rect: Rect };

export type BatchedGetRectCallback = (entries: BatchedGetRectEntry[]) => void;

export type BatchedGetRectReturn = (element: Element) => void;

export function batchedGetRect(
  callback: BatchedGetRectCallback,
): BatchedGetRectReturn {
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

  return batched((elements) => {
    document.body.appendChild(style);
    callback(
      elements.map((target) => ({
        target,
        rect: getRect(target),
      })),
    );
    document.body.removeChild(style);
  });
}
