import { Batcher } from "./batcher";
import { getOffsetParent, isDocumentElement, mutatedElements } from "./dom";

function getContainingElement(
	element: HTMLElement,
	position: string,
): HTMLElement | null {
	if (isDocumentElement(element)) {
		return null;
	} else if (position === "absolute" || position === "fixed") {
		return getOffsetParent(element);
	} else {
		return element.parentElement;
	}
}

export type PositioningObserverEntry = {
	element: HTMLElement;
	containingElement: HTMLElement | null;
	position: string;
};

export class PositioningObserver {
	#batcher: Batcher<PositioningObserverEntry[]>;
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

		this.#batcher = new Batcher<PositioningObserverEntry[]>({
			onRun: (run) => {
				const entries: PositioningObserverEntry[] = [];
				run(entries);
				callback(entries);
			},
		});
	}

	async invalidate(element: HTMLElement) {
		await this.#batcher.task((entries) => {
			if (this.#elements.has(element)) {
				const position = getComputedStyle(element).position;
				entries.push({
					element,
					position,
					containingElement: getContainingElement(element, position),
				});
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
