import { comp, map, Transducer } from "@thi.ng/transducers";
import { tuples } from "./transducer";
import { rect, Rect } from "@thi.ng/geom";
import { Vec } from "@thi.ng/vectors";

export function rectTx(
  pos: Transducer<number, Vec>,
  size: Transducer<number, Vec>,
): Transducer<number, Rect> {
  return comp(
    tuples(pos, size),
    map(([pos, size]) => rect(pos, size)),
  );
}
