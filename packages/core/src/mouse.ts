import { Vec2, vec2Set } from "./vec2";

export function mousePositionFromEvent(out: Vec2, event: MouseEvent): Vec2 {
	return vec2Set(out, event.clientX, event.clientY);
}
