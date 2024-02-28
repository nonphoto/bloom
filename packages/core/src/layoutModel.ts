import { MaybeBehavior } from "./behavior";
import { Mat2d } from "./mat2d";
import { Rect } from "./rect";
import { Vec2 } from "./vec2";

interface Layout {
	parent: Element;
	rect: Rect;
	scroll: MaybeBehavior<Vec2>;
	transform: MaybeBehavior<Mat2d>;
	matrix: MaybeBehavior<Mat2d>;
}

export interface LayoutModel {
	layouts: Map<Element, Partial<Layout>>;
}

function layoutModelWithLayout(
	layoutModel: LayoutModel,
	element: Element,
	fn: (layout: Partial<Layout>) => void,
): LayoutModel {
	const layout = layoutModel.layouts.get(element) ?? {};
	layoutModel.layouts.set(element, layout);
	fn(layout);
	return layoutModel;
}

export function layoutModelSetTransform(
	layoutModel: LayoutModel,
	element: Element,
	transform: MaybeBehavior<Mat2d>,
): LayoutModel {
	return layoutModelWithLayout(layoutModel, element, (layout) => {
		layout.transform = transform;
	});
}
