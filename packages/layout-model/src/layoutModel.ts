import {
	Batcher,
	Behavior,
	isBehavior,
	Mat2d,
	mat2dCopy,
	mat2dCreate,
	mat2dFromTranslation,
	mat2dMultiply,
	mat2dTranslate,
	MaybeBehavior,
	Rect,
	rectCenter,
	Vec2,
	vec2Create,
	vec2Negate,
	vec2Set,
	vec2Sub,
} from "@chloranthy/core";
import {
	Accessor,
	createEffect,
	createMemo,
	createRoot,
	createSignal,
	onCleanup,
	untrack,
} from "solid-js";
import {
	createDisposableEffect,
	getNearestScrollingAncestor,
	getOffsetParent,
	getScrollEmitter,
	isDocumentElement,
	mutatedElements,
	getWillScroll,
	walkDescendants,
	walkAncestors,
	safeDocument,
} from "./utils.js";
import { SingletonMap } from "./singletonMap.js";
import { ReactiveMap } from "@solid-primitives/map";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { createMutationObserver } from "@solid-primitives/mutation-observer";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createSingletonRoot } from "@solid-primitives/rootless";

type RectRoot = {
	rect: Accessor<Rect | undefined>;
	invalidate(): Promise<void>;
};

type ScrollRoot = {
	scrollTranslation: Accessor<Vec2>;
	invalidate(): void;
};

type ParentRoot = {
	parent: Accessor<HTMLElement | null>;
	invalidate(): void;
};

type MatrixRoot = {
	matrix: Accessor<MaybeBehavior<Mat2d> | undefined>;
	intermediateMatrix: Accessor<MaybeBehavior<Mat2d> | undefined>;
	rectPosition: Accessor<Vec2 | undefined>;
};

/**
 * The return type of {@link createLayoutModel}.
 */
export type LayoutModelReturn = {
	/**
	 * Sets the transform property of an element.
	 * @param element - The element to set the transform of.
	 * @param transform - The transform to set on the element.
	 */
	setTransform(
		element: HTMLElement,
		transform: MaybeBehavior<Mat2d> | undefined,
	): void;

	/**
	 * Returns an accessor for the layout rect of an element.
	 * The layout rect is a document relative Rect; it is equivalent to calling `element.getBoundingClientRect()` when the transform properties and scroll positions of all elements in the document are unset. The accessor updates whenever the Rect changes.
	 * @param element - The element to get the layout rect accessor of.
	 * @returns An accessor that returns the layout rect of the element.
	 */
	useRect(
		element: MaybeAccessor<HTMLElement | null | undefined>,
	): Accessor<Rect | undefined>;

	/**
	 * Returns an accessor for the view matrix of the element.
	 * The view matrix represents all affine transformations of an element applied to the layout rect of the element, including the scroll translations and transforms of all of its ancestors. The accessor updates whenever the calculated view matrix changes.
	 * @remarks Premultiplying the layout rect by the view matrix will result in a quad representing the exact placement of the element on screen.
	 * @param element - The element to get the view matrix accessor of.
	 * @returns An accessor that returns the view matrix of the element.
	 */
	useMatrix(
		element: MaybeAccessor<HTMLElement | null | undefined>,
	): Accessor<MaybeBehavior<Mat2d> | undefined>;

	/**
	 * Returns an accessor for transformation matrix of an element, as set by `setTransform`.
	 * @param element - The element to get the transform property accessor of.
	 * @returns An accessor that returns the transformation matrix of the element.
	 */
	useTransform(
		element: MaybeAccessor<HTMLElement | null | undefined>,
	): Accessor<MaybeBehavior<Mat2d> | undefined>;

	/**
	 * Invalidate the measured layout rect of the element, causing the layout model to remeasure it. This can sometimes be necessary if it's position in the layout changed without its width or height changing.
	 * @param element - The element to invalidate.
	 */
	invalidateRect(element: HTMLElement): Promise<void>;

	/**
	 * Invalidate the measured overflow property of the element, causing the layout model to rebind scroll event listeners. This can sometimes be necessary if the element's `overflow` style property changed from `auto` or `scroll` to `hidden`, or vice versa.
	 * @param element - The element to invalidate.
	 */
	invalidateScroll(element: HTMLElement): void;

	/**
	 * Invalidate the offset parent of the element, causing the layout model to recalculate the parent tree. This can sometimes be necessary if the offset parent of the element changed due to the `position` property of the element or one of its ancestors changing.
	 * @param element - The element to invalidate.
	 */
	invalidateParent(element: HTMLElement): void;
};

const layoutModelStub: LayoutModelReturn = {
	setTransform() {},
	useRect() {
		return () => undefined;
	},
	useMatrix() {
		return () => undefined;
	},
	useTransform() {
		return () => undefined;
	},
	async invalidateRect() {},
	invalidateScroll() {},
	invalidateParent() {},
};

/**
 * Creates a new layout model from the root element. The layout model will track changes to the layout rects and view matrices of elements in the document.
 * @param root - The root element of the document.
 */
export function createLayoutModel(root: HTMLElement): LayoutModelReturn {
	const transformMap = new ReactiveMap<HTMLElement, Behavior<Mat2d> | Mat2d>();

	createResizeObserver(
		() => Array.from(rectRoots.keys()),
		(_, element) => {
			if (element instanceof HTMLElement) {
				rectRoots.get(element)?.invalidate();
			}
		},
	);

	createMutationObserver(
		root,
		{ childList: true, subtree: true },
		(records) => {
			for (const element of mutatedElements(records)) {
				rectRoots.get(element)?.invalidate();
				parentRoots.get(element)?.invalidate();
			}
		},
	);

	const layoutBatcher = new Batcher({
		onRun: (run) => {
			const transforms = new Map<HTMLElement, string>();
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

	const rectRoots = new SingletonMap<HTMLElement, RectRoot>((element) => {
		const [rect, setRect] = createSignal<Rect | undefined>(undefined, {
			equals: false,
		});

		const invalidate = () => {
			return layoutBatcher.enqueue(() => {
				const rect = element.getBoundingClientRect();
				walkAncestors(element, (parent) => {
					rect.x += parent.scrollLeft;
					rect.y += parent.scrollTop;
				});
				setRect(rect);
			});
		};

		return { rect, invalidate };
	});

	const scrollRoots = new SingletonMap<HTMLElement, ScrollRoot>((element) => {
		const [scrollTranslation, setScrollTranslation] = createSignal(
			vec2Create(),
			{ equals: false },
		);
		const [willScroll, setWillScroll] = createSignal(false);

		const onScroll = () => {
			setScrollTranslation((prev) =>
				vec2Set(prev, -element.scrollLeft, -element.scrollTop),
			);
		};

		const invalidate = () => {
			setWillScroll(getWillScroll(element));
		};

		createEffect(() => {
			if (willScroll()) {
				const scrollEmitter = getScrollEmitter(element);
				scrollEmitter.addEventListener("scroll", onScroll, { passive: true });
				onCleanup(() => {
					scrollEmitter.removeEventListener("scroll", onScroll);
				});
			}
		});

		createEffect(() => {
			invalidate();
		});

		return {
			scrollTranslation,
			invalidate,
		};
	});

	const parentRoots = new SingletonMap<HTMLElement, ParentRoot>((element) => {
		const [parent, setParent] = createSignal<HTMLElement | null>(null);

		const invalidate = () => {
			const position = getComputedStyle(element).position;
			if (isDocumentElement(element)) {
				setParent(null);
			} else if (position === "sticky") {
				setParent(getNearestScrollingAncestor(element));
			} else if (position === "absolute" || position === "fixed") {
				setParent(getOffsetParent(element));
			} else {
				setParent(element.parentElement);
			}
		};

		createEffect(() => {
			invalidate();
		});

		return { parent, invalidate };
	});

	const matrixRoots: SingletonMap<HTMLElement, MatrixRoot> = new SingletonMap(
		(element) => {
			const parentRoot = parentRoots.use(element);
			const rectRoot = rectRoots.use(element);
			const scrollRoot = scrollRoots.use(element);

			const parentMatrixRoot = createMemo(() => {
				const parentValue = parentRoot.parent();
				if (parentValue) {
					return matrixRoots.use(parentValue);
				}
			});

			const rectPositionValue = vec2Create();
			const rectPosition = createMemo<Vec2 | undefined>(
				() => {
					const rectValue = rectRoot.rect();
					if (rectValue) {
						return rectCenter(rectPositionValue, rectValue);
					}
				},
				undefined,
				{ equals: false },
			);

			const layoutDeltaValue = vec2Create();
			const layoutDelta = createMemo<Vec2 | undefined>(
				() => {
					const parentRectPositionValue = parentMatrixRoot()?.rectPosition();
					const rectPositionValue = rectPosition();
					if (rectPositionValue) {
						if (parentRectPositionValue) {
							return vec2Sub(
								layoutDeltaValue,
								rectPositionValue,
								parentRectPositionValue,
							);
						} else if (isDocumentElement(element)) {
							return rectPositionValue;
						}
					}
				},
				undefined,
				{ equals: false },
			);

			function calcLayoutMatrix(
				layoutMatrix: Mat2d,
				parentIntermediateMatrix: Mat2d,
				layoutDelta: Vec2,
			) {
				return mat2dTranslate(
					layoutMatrix,
					parentIntermediateMatrix,
					layoutDelta,
				);
			}

			const layoutMatrixValue = mat2dCreate();
			const layoutMatrix = createMemo<MaybeBehavior<Mat2d> | undefined>(
				() => {
					const parentIntermediateMatrixValue =
						parentMatrixRoot()?.intermediateMatrix();
					const layoutDeltaValue = layoutDelta();
					if (layoutDeltaValue) {
						if (isDocumentElement(element)) {
							return () =>
								mat2dFromTranslation(layoutMatrixValue, layoutDeltaValue);
						} else if (parentIntermediateMatrixValue) {
							if (isBehavior(parentIntermediateMatrixValue)) {
								return (t) =>
									calcLayoutMatrix(
										layoutMatrixValue,
										parentIntermediateMatrixValue(t),
										layoutDeltaValue,
									);
							} else {
								return calcLayoutMatrix(
									layoutMatrixValue,
									parentIntermediateMatrixValue,
									layoutDeltaValue,
								);
							}
						}
					}
				},
				undefined,
				{ equals: false },
			);

			function calcIntermediateMatrix(
				layoutMatrix: Mat2d,
				scrollTranslation: Vec2,
				transform?: Mat2d,
			) {
				mat2dCopy(intermediateMatrixValue, layoutMatrix);
				if (transform) {
					mat2dMultiply(
						intermediateMatrixValue,
						intermediateMatrixValue,
						transform,
					);
				}
				return mat2dTranslate(
					intermediateMatrixValue,
					intermediateMatrixValue,
					scrollTranslation,
				);
			}

			const intermediateMatrixValue = mat2dCreate();
			const intermediateMatrix = createMemo<
				Behavior<Mat2d> | Mat2d | undefined
			>(
				() => {
					const layoutMatrixValue = layoutMatrix();
					const transform = transformMap.get(element);
					const scrollTranslationValue = scrollRoot.scrollTranslation();
					if (layoutMatrixValue) {
						if (isBehavior(transform) || isBehavior(layoutMatrixValue)) {
							return (t) =>
								calcIntermediateMatrix(
									isBehavior(layoutMatrixValue)
										? layoutMatrixValue(t)
										: layoutMatrixValue,
									scrollTranslationValue,
									isBehavior(transform) ? transform(t) : transform,
								);
						} else {
							calcIntermediateMatrix(
								layoutMatrixValue,
								scrollTranslationValue,
								transform,
							);
						}
					}
				},
				undefined,
				{ equals: false },
			);

			const negativeTranslationValue = vec2Create();
			const negativeTranslation = createMemo<Vec2 | undefined>(
				() => {
					const rectPositionValue = rectPosition();
					if (rectPositionValue) {
						return vec2Negate(negativeTranslationValue, rectPositionValue);
					}
				},
				undefined,
				{ equals: false },
			);

			function calcMatrix(
				matrix: Mat2d,
				negativeTranslation: Vec2,
				layoutMatrix: Mat2d,
			) {
				mat2dTranslate(matrix, matrix, negativeTranslation);
				return mat2dMultiply(matrix, matrix, layoutMatrix);
			}

			const matrixValue = mat2dCreate();
			const matrix = createMemo<Behavior<Mat2d> | undefined>(
				() => {
					const negativeTranslationValue = negativeTranslation();
					const layoutMatrixValue = layoutMatrix();
					if (negativeTranslationValue && layoutMatrixValue) {
						if (isBehavior(layoutMatrixValue)) {
							return (t) =>
								calcMatrix(
									matrixValue,
									negativeTranslationValue,
									layoutMatrixValue(t),
								);
						} else {
							calcMatrix(
								matrixValue,
								negativeTranslationValue,
								layoutMatrixValue,
							);
						}
					}
				},
				undefined,
				{ equals: false },
			);

			return { matrix, intermediateMatrix, rectPosition };
		},
	);

	function setTransform(
		element: HTMLElement,
		transform: Behavior<Mat2d> | Mat2d | undefined,
	) {
		if (transform) {
			return transformMap.set(element, transform);
		} else {
			return transformMap.delete(element);
		}
	}

	onCleanup(() => {
		for (const element of untrack(() => transformMap.keys())) {
			setTransform(element, undefined);
		}
	});

	return {
		setTransform,
		useRect(element: MaybeAccessor<HTMLElement | null | undefined>) {
			const memo = createMemo(() => {
				const elementValue = access(element);
				if (elementValue) {
					return rectRoots.use(elementValue).rect;
				}
			});
			return () => memo()?.();
		},
		useMatrix(element: MaybeAccessor<HTMLElement | null | undefined>) {
			const memo = createMemo(() => {
				const elementValue = access(element);
				if (elementValue) {
					return matrixRoots.use(elementValue).matrix;
				}
			});
			return () => memo()?.();
		},
		useTransform(element: MaybeAccessor<HTMLElement | null | undefined>) {
			return () => {
				const elementValue = access(element);
				if (elementValue) {
					return transformMap.get(elementValue);
				}
			};
		},
		async invalidateRect(element: HTMLElement) {
			return rectRoots.get(element)?.invalidate();
		},
		invalidateScroll(element: HTMLElement) {
			scrollRoots.get(element)?.invalidate();
		},
		invalidateParent(element: HTMLElement) {
			parentRoots.get(element)?.invalidate();
		},
	};
}

/**
 * Returns a layout model created from the document element. Subsequent calls will return the same layout model.
 * @returns The layout model.
 */
export const useLayoutModel = createSingletonRoot<LayoutModelReturn>(() => {
	const document = safeDocument();
	return document
		? createLayoutModel(document.documentElement)
		: layoutModelStub;
});

/**
 * A layout model that tracks changes to the layout rects and view matrices of elements in the document.
 */
export class LayoutModel {
	#observer: LayoutModelReturn;
	#dispose: () => void;

	/**
	 * Creates a new layout model from the root element.
	 * @param root - The root element of the document.
	 */
	constructor(root: HTMLElement) {
		const { observer, dispose } = createRoot((dispose) => {
			const observer = createLayoutModel(root);
			return { observer, dispose };
		});

		this.#observer = observer;
		this.#dispose = dispose;
	}

	/**
	 * Properly disposes the reactive graph for this layout model.
	 */
	dispose(): void {
		this.#dispose();
	}

	/**
	 * Sets the transform property of an element.
	 * @param element - The element to set the transform of.
	 * @param transform - The transform to set on the element.
	 */
	setTransform(element: HTMLElement, transform: Mat2d | undefined): void {
		this.#observer.setTransform(element, transform);
	}

	/**
	 * @returns A disposing function. Calling the function disposes the reactive graph for the callback.
	 */
	useRect(
		element: HTMLElement,
		callback: (rect: Rect | undefined) => void,
	): () => void {
		return createDisposableEffect(
			() => this.#observer.useRect(element),
			callback,
		);
	}

	/**
	 * @returns A disposing function. Calling the function disposes the reactive graph for the callback.
	 */
	useMatrix(
		element: HTMLElement,
		callback: (matrix: MaybeBehavior<Mat2d> | undefined) => void,
	): () => void {
		return createDisposableEffect(
			() => this.#observer.useMatrix(element),
			callback,
		);
	}

	/**
	 * Invalidate the measured layout rect of the element, causing the layout model to remeasure it. This can sometimes be necessary if it's position in the layout changed without its width or height changing.
	 * @param element - The element to invalidate.
	 */
	invalidateRect(element: HTMLElement) {
		this.#observer.invalidateRect(element);
	}

	/**
	 * Invalidate the measured overflow property of the element, causing the layout model to rebind scroll event listeners. This can sometimes be necessary if the element's `overflow` style property changed from `auto` or `scroll` to `hidden`, or vice versa.
	 * @param element - The element to invalidate.
	 */
	invalidateScroll(element: HTMLElement) {
		this.#observer.invalidateScroll(element);
	}

	/**
	 * Invalidate the offset parent of the element, causing the layout model to recalculate the parent tree. This can sometimes be necessary if the offset parent of the element changed due to the `position` property of the element or one of its ancestors changing.
	 * @param element - The element to invalidate.
	 */
	invalidateParent(element: HTMLElement) {
		this.#observer.invalidateParent(element);
	}
}
