import { Rect } from "@thi.ng/geom";
import { Batcher } from "./batcher";
import { walkAncestors, walkDescendants } from "./dom";
import { rectFromDOMRect } from "./rect";

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
	#batcher: Batcher<RectObserverEntry[]>;
	#elements: Set<HTMLElement>;
	#resizeObserver: ResizeObserver;

	constructor(
		root: HTMLElement,
		callback: (entries: RectObserverEntry[]) => void,
	) {
		this.#elements = new Set<HTMLElement>();
		this.#resizeObserver = new ResizeObserver((entries) => {
			for (const { target } of entries) {
				if (target instanceof HTMLElement) {
					this.invalidate(target);
				}
			}
		});

		this.#batcher = new Batcher<RectObserverEntry[]>({
			onRun: (run) => {
				const transforms = new WeakMap<HTMLElement, string>();

				walkDescendants(root, (element) => {
					transforms.set(element, element.style.transform);
					element.style.transform = "";
				});

				const entries: RectObserverEntry[] = [];
				run(entries);

				walkDescendants(root, (element) => {
					const transform = transforms.get(element);
					if (transform) {
						element.style.transform = transform;
					}
				});

				callback(entries);
			},
		});
	}

	async invalidate(element: HTMLElement) {
		await this.#batcher.task((entries) => {
			if (this.#elements.has(element)) {
				entries.push({ target: element, rect: getRect(element) });
			}
		});
	}

	async getRect(element: HTMLElement) {
		let rect: Rect;
		return this.#batcher
			.task(() => {
				rect = getRect(element);
			})
			.then(() => rect);
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
