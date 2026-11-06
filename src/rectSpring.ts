import { comp, map, Transducer } from "@thi.ng/transducers";
import { springPosition2, tuples } from "./transducer";
import { VecSpring } from "@nonphoto/spring";
import { rect, Rect } from "@thi.ng/geom";

export function rectSpringTx(pos: VecSpring, size: VecSpring): Transducer<number, Rect> {
  return comp(
    tuples(springPosition2(pos), springPosition2(size)),
    map(([pos, size]) => rect(pos, size)),
  );
}
