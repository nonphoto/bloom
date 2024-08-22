import { setC2, Vec } from "@thi.ng/vectors";

export function mousePositionFromEvent(out: Vec, event: MouseEvent): Vec {
	return setC2(out, event.clientX, event.clientY);
}
