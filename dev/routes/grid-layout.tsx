import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { Rect, rect } from "@thi.ng/geom";
import { invert33, Mat, mul33 } from "@thi.ng/matrices";
import { comp, map, permutations, Transducer } from "@thi.ng/transducers";
import { Accessor, createSignal } from "solid-js";
import {
  createBatchedGetRect,
  createRect,
  styleTransformMat33,
} from "../../src";
import {
  createAnimation,
  createTransformAnimation,
} from "../../src/createAnimation";
import { createRectTransducer } from "../../src/createRectAnimation";
import { createSpring2 } from "../../src/createSpring";
import { untransform33 } from "../../src/rect/untransform";
import { springPosition2, tuples } from "../../src/transducer";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];
const damping = dampingFromHalflife(200);
const stiffness = stiffnessFromDamping(1, damping);
const getRect = createBatchedGetRect(document.documentElement);

export default function GridLayoutRoute() {
  const [index, setIndex] = createSignal(0);
  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(getRect, element);
  const transform = createRectTransducer(rect, { damping, stiffness });
  createTransformAnimation(element, transform);

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
          display: "flex",
          "align-items": "center",
        }}
      >
        <Child parentTransform={transform()} getRect={getRect} />
      </div>
    </div>
  );
}

function Child(props: {
  parentTransform: Transducer<number, Mat | undefined>;
  getRect: (element: HTMLElement) => Promise<Rect>;
}) {
  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(getRect, element);
  const transform = createRectTransducer(rect, { damping, stiffness });
  createTransformAnimation(element, transform);

  return (
    <img
      ref={setElement}
      src="https://images.unsplash.com/photo-1591350832024-68c7491dd46e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      style={{ width: "100%", "user-select": "none" }}
    />
  );
}

// const transform = () => {
//   const targetRectValue = targetRect();
//   return comp(
//     tuples(
//       props.parentTransform,
//       springPosition2(pos()),
//       springPosition2(size()),
//     ),
//     map(([parentTransform, pos, size]) => {
//       console.log(parentTransform)
//       if (parentTransform && targetRectValue && pos && size) {
//         return mul33(
//           [],
//           invert33([], parentTransform)!,
//           untransform33([], targetRectValue, rect(pos, size)),
//         );
//       }
//     }),
//   );
// };
