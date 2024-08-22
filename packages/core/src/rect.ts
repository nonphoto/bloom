import { rect, Rect } from "@thi.ng/geom";

export function rectFromDOMRect(a: DOMRect): Rect {
	const b = rect();
	b.pos[0] = a.top;
	b.pos[1] = a.left;
	b.size[0] = a.width;
	b.size[1] = a.height;
	return b;
}
