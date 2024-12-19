import { access } from "@solid-primitives/utils";
import { rect } from "@thi.ng/geom";
import { comp, map, permutations } from "@thi.ng/transducers";
import { createSignal } from "solid-js";
import { createRect, styleTransformMat2d } from "../../src";
import { createAnimation } from "../../src/createAnimation";
import { createSpring2 } from "../../src/createSpring";
import { untransform } from "../../src/rect/untransform";
import { springPosition2, tuples } from "../../src/transducer";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];

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

  createAnimation(element, () => {
    const targetRectValue = targetRect();
    return comp(
      tuples(springPosition2(pos()), springPosition2(size())),
      map((args) => ({
        transform: targetRectValue
          ? styleTransformMat2d(untransform(targetRectValue, rect(...args), []))
          : undefined,
      })),
    );
  });

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
