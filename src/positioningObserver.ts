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
				entries.push(positioningObserverEntryCreate(element));
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
