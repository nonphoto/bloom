import { access } from "@solid-primitives/utils";
import { rect, Rect } from "@thi.ng/geom";
import { Mat } from "@thi.ng/matrices";
import { comp, map, permutations } from "@thi.ng/transducers";
import { createMemo, createSignal } from "solid-js";
import {
  createRect,
  createSpring2,
  log,
  maybe,
  springPosition2,
  styleTransformMat2d,
  tuples,
} from "../../src";
import { createAnimation } from "../../src/solid/animation";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];

function rectDivide(a: Rect, b: Rect, out: Mat): Mat {
  out[0] = b.size[0] / a.size[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = b.size[1] / a.size[1];
  out[4] = b.pos[0] + b.size[0] / 2 - (a.pos[0] + a.size[0] / 2);
  out[5] = b.pos[1] + b.size[1] / 2 - (a.pos[1] + a.size[1] / 2);
  console.log(a.pos[0], b.pos[0]);
  return out;
}

export default function Layout() {
  const [index, setIndex] = createSignal(0);
  const [element, setElement] = createSignal<HTMLElement>();

  const targetRect = createRect(element);

  const pos = createSpring2(
    undefined,
    undefined,
    () => access(targetRect)?.pos,
  );
  const size = createSpring2(
    undefined,
    undefined,
    () => access(targetRect)?.size,
  );

  const tx = createMemo(() =>
    maybe(targetRect, (targetRect) =>
      comp(
        tuples(springPosition2(log(pos())), springPosition2(size())),
        map((args) => {
          return styleTransformMat2d(rectDivide(targetRect, rect(...args), []));
        }),
      ),
    ),
  );

  createAnimation(element, "transform", tx);

  return (
    <div
      style={{
        height: "100svh",
        display: "grid",
        "grid-template-columns": "3fr 2fr 1fr",
        "grid-template-rows": "3fr 2fr 1fr",
      }}
      onClick={() => {
        setIndex((index) => (index + 1) % areas.length);
      }}
    >
      <div
        ref={setElement}
        style={{
          background: "pink",
          "grid-row-start": areas[index()]?.[0],
          "grid-column-start": areas[index()]?.[1],
        }}
      />
    </div>
  );
}
