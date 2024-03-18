import { Batcher } from "./batcher";
import { Bus } from "./bus";
import {
	getNearestScrollingAncestor,
	getOffsetParent,
	getWillScroll,
	isDocumentElement,
	mutatedElements,
	walkAncestors,
	walkDescendants,
} from "./dom";
import {
	Mat2d,
	mat2dCopy,
	mat2dCreate,
	mat2dFromTranslation,
	mat2dMultiply,
	mat2dTranslate,
} from "./mat2d";
import { catchMaybe, maybe } from "./maybe";
import { Rect, rectCenter } from "./rect";
import { Vec2, vec2Create, vec2Negate } from "./vec2";

type Layout = {
	rect: Rect;
	scroll: Vec2;
	onScroll: () => void;
	parent: HTMLElement | null;
};

function withValue<T extends WeakKey, U>(
	map: WeakMap<T, U>,
	key: T,
	fn: (value: U) => void,
): void {
	const value = map.get(key);
	if (value) {
		fn(value);
	}
}

function LayoutObserver(root: HTMLElement) {
	let layouts = new WeakMap<HTMLElement, Layout>();
	const rectBus = new Bus<HTMLElement, Rect | undefined>();
	const parentBus = new Bus<HTMLElement, HTMLElement | null>();
	const scrollBus = new Bus<HTMLElement, Vec2 | undefined>();

	const resizeObserver = new ResizeObserver((entries) => {
		for (const { target } of entries) {
			if (target instanceof HTMLElement) {
				invalidateRect(target);
			}
		}
	});

	const mutationObserver = new MutationObserver((records) => {
		for (const element of mutatedElements(records)) {
			invalidateRect(element);
		}
	});
	mutationObserver.observe(root, { childList: true, subtree: true });

	const layoutBatcher = new Batcher({
		onRun: (run) => {
			walkDescendants(root, (element) => {
				const newLayouts = new WeakMap<HTMLElement, Layout>();
				if (layouts.has(element)) {
					newLayouts.set(element, layouts.get(element)!);
				} else {
					newLayouts.set(element, {});
				}
			});

			run();
		},
	});

	const transformBatcher = new Batcher({
		onRun: (run) => {
			const transforms = new WeakMap<HTMLElement, string>();
			walkDescendants(root, (element) => {
				transforms.set(element, element.style.transform);
				element.style.transform = "";
			});

			run();

			walkDescendants(root, (element) => {
				const transform = transforms.get(element);
				if (transform) {
					element.style.transform = transform;
				}
			});
		},
	});

	const invalidateRect = async (element: HTMLElement) => {
		await layoutBatcher.enqueue();
		await transformBatcher.enqueue(() => {
			withValue(layouts, element, (layout) => {
				const rect = element.getBoundingClientRect();
				walkAncestors(element, (ancestor) => {
					rect.x += ancestor.scrollLeft;
					rect.y += ancestor.scrollTop;
				});
				layout.rect = rect;
			});
		});
		rectBus.notify(element, layouts.get(element)?.rect);
	};

	const invalidateParent = async (element: HTMLElement) => {
		await layoutBatcher.enqueue();
		withValue(layouts, element, (layout) => {
			const position = getComputedStyle(element).position;
			if (isDocumentElement(element)) {
				layout.parent = null;
			} else if (position === "sticky") {
				layout.parent = getNearestScrollingAncestor(element);
			} else if (position === "absolute" || position === "fixed") {
				layout.parent = getOffsetParent(element);
			} else {
				layout.parent = element.parentElement;
			}
		});
		parentBus.notify(element, layouts.get(element)?.parent ?? null);
	};

	const invalidateScroll = async (element: HTMLElement) => {
		await layoutBatcher.enqueue();
		const layout = layouts.get(element) {

		}
		withValue(layouts, element, (layout) => {
			const scrollEmitter = getScrollEmitter(element)
			if (getWillScroll(element)) {
				scrollEmitter.addEventListener("scroll", onScroll, { passive: true });

			}
		});
		scrollBus.notify(element, layouts.get(element)?.scroll);
	};

	const addRectListener: typeof rectBus.add = (element, listener) => {
		resizeObserver.observe(element);
		rectBus.add(element, listener);
	};

	const removeRectListener: typeof rectBus.remove = (element, listener) => {
		resizeObserver.unobserve(element);
		rectBus.remove(element, listener);
	};

	const addScrollListener: typeof scrollBus.add = (element, listener) => {
		element.addEventListener("scroll");
	};

	return {
		invalidateRect,
		invalidateParent,
		addRectListener,
		removeRectListener,
		addParentListener: parentBus.add.bind(parentBus),
		removeParentListener: parentBus.remove.bind(parentBus),
	};
}

const rectPosition = vec2Create();
const getRectPosition = () => {
	rectCenter(rectPosition, rect());
};

const layoutDelta = vec2Create();
const getLayoutDelta = () => {
	if (parentRectPosition) {
		return vec2Sub(layoutDelta, rectPosition, parentRectPosition);
	} else if (isDocumentElement(element)) {
		return rectPosition;
	}
};

const layoutMatrix = mat2dCreate();
const getLayoutMatrix = () => {
	if (isDocumentElement(element)) {
		return mat2dFromTranslation(layoutMatrix, getLayoutDelta());
	} else {
		return mat2dTranslate(
			layoutMatrix,
			layouts.get(parent()).getIntermediateMatrix(),
			getLayoutDelta(),
		);
	}
};

const intermediateMatrix = mat2dCreate();
const getIntermediateMatrix = catchMaybe(() => {
	mat2dCopy(intermediateMatrix, getLayoutMatrix());
	const transformValue = transform();
	if (transformValue) {
		mat2dMultiply(intermediateMatrix, intermediateMatrix, transformValue);
	}
	return mat2dTranslate(
		intermediateMatrix,
		intermediateMatrix,
		scrollTranslation(),
	);
});

const negativeTranslation = vec2Create();
const getNegativeTranslation = () => {
	return vec2Negate(negativeTranslation, rectPosition());
};

const matrix = mat2dCreate();
const getMatrix = catchMaybe(() => {
	mat2dTranslate(matrix, matrix, getNegativeTranslation());
	return mat2dMultiply(matrix, matrix, getLayoutMatrix());
});
jd2;
