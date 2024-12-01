import { Batcher } from "./batcher";
import { getContainingElement, mutatedElements } from "./dom";

export type PositioningObserverEntry = {
  target: HTMLElement;
  containingElement: HTMLElement | null;
};

function positioningObserverEntryCreate(target: HTMLElement) {
  return {
    target,
    containingElement: getContainingElement(target),
  };
}

export class PositioningObserver {
  #entries: PositioningObserverEntry[] = [];
  #batcher: Batcher;
  #elements: Set<HTMLElement>;
  #mutationObserver: MutationObserver;

  constructor(
    root: HTMLElement,
    callback: (entries: PositioningObserverEntry[]) => void,
  ) {
    this.#elements = new Set<HTMLElement>();
    this.#mutationObserver = new MutationObserver((records) => {
      for (const element of mutatedElements(records)) {
        this.invalidate(element);
      }
    });
    this.#mutationObserver.observe(root, { childList: true, subtree: true });

    this.#batcher = new Batcher();
    this.#batcher.addEventListener("postrun", () => {
      callback(this.#entries);
      this.#entries = [];
    });
  }

  invalidate(element: HTMLElement) {
    this.#batcher.enqueue(() => {
      if (this.#elements.has(element)) {
        this.#entries.push(positioningObserverEntryCreate(element));
      }
    });
  }

  observe(target: HTMLElement) {
    this.#elements.add(target);
  }

  unobserve(target: HTMLElement) {
    this.#elements.delete(target);
  }

  disconnect() {
    this.#elements.clear();
    this.#mutationObserver.disconnect();
  }
}
