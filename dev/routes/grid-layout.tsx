import { rect } from "@thi.ng/geom";
import { invert33, Mat, mul33 } from "@thi.ng/matrices";
import { comp, map, permutations, Transducer } from "@thi.ng/transducers";
import { Accessor, createSignal } from "solid-js";
import { createRect, styleTransformMat33 } from "../../src";
import { createAnimation } from "../../src/createAnimation";
import { createSpring2 } from "../../src/createSpring";
import { untransform33 } from "../../src/rect/untransform";
import { springPosition2, tuples } from "../../src/transducer";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];

export default function GridLayoutRoute() {
  const [index, setIndex] = createSignal(0);
  const [element, setElement] = createSignal<HTMLElement>();

  const targetRect = createRect(element);

  const pos = createSpring2(() => targetRect()?.pos);
  const size = createSpring2(() => targetRect()?.size);

  const transform = () => {
    const targetRectValue = targetRect();
    return comp(
      tuples(springPosition2(pos()), springPosition2(size())),
      map(([pos, size]) =>
        targetRectValue
          ? untransform33([], targetRectValue, rect(pos, size))
          : undefined,
      ),
    );
  };

  createAnimation(element, () =>
    comp(
      transform(),
      map((transform) => ({ transform: styleTransformMat33(transform) })),
    ),
  );

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
        <Image parentTransform={transform} />
      </div>
    </div>
  );
}

function Image({
  parentTransform,
}: {
  parentTransform: Accessor<Transducer<number, Mat | undefined>>;
}) {
  const [element, setElement] = createSignal<HTMLElement>();

  const targetRect = createRect(element);
  const pos = createSpring2(() => targetRect()?.pos);
  const size = createSpring2(() => targetRect()?.size);

  const transform = () => {
    const targetRectValue = targetRect();
    return comp(
      tuples(
        parentTransform(),
        springPosition2(pos()),
        springPosition2(size()),
      ),
      map(([parentTransform, pos, size]) => {
        if (parentTransform && targetRectValue) {
          console.log(
            parentTransform[6],
            pos[0],
            invert33([], parentTransform)![6],
            untransform33([], targetRectValue, rect(pos, size))[6],
          );

          return mul33(
            [],
            invert33([], parentTransform)!,
            untransform33([], targetRectValue, rect(pos, size)),
          );
        }
      }),
    );
  };

  createAnimation(element, () =>
    comp(
      transform(),
      map((transform) => ({ transform: styleTransformMat33(transform) })),
    ),
  );

  return (
    <img
      ref={setElement}
      src="https://images.unsplash.com/photo-1591350832024-68c7491dd46e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      style={{ width: "100%", "user-select": "none" }}
    />
  );
}
