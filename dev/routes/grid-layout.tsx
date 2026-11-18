import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { comp, map, permutations } from "@thi.ng/transducers";
import { createSignal, onSettled } from "solid-js";
import { rectTx } from "../../src/rectSpring";
import { untransform33 } from "../../src/rect/untransform";
import { SpringController2 } from "../../src/springController";
import { ComponentProps, JSX } from "@solidjs/web";
import {
  batchedGetRect,
  BatchedGetRectCallback,
} from "../../src/batchedGetRect";
import { animateTransform } from "../../src/animateTransform";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];
const damping = dampingFromHalflife(200);
const stiffness = stiffnessFromDamping(1, damping);

export default function GridLayoutRoute() {
  const [index, setIndex] = createSignal(0);

  onSettled(() => {
    const callbacks = new Set<BatchedGetRectCallback>();
    const getRect = batchedGetRect((entries) => {
      for (const callback of callbacks) {
        callback(entries);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        getRect(entry.target);
      }
    });

    const elements = Array.from(
      document.querySelectorAll(".box"),
    ) as HTMLElement[];

    for (const element of elements) {
      resizeObserver.observe(element);

      const posSpring = new SpringController2(undefined, {
        stiffness,
        damping,
      });

      const sizeSpring = new SpringController2(undefined, {
        stiffness,
        damping,
      });

      callbacks.add((entries) => {
        for (const { rect, target } of entries) {
          if (target === element) {
            posSpring.next(rect.pos);
            sizeSpring.next(rect.size);
            if (posSpring.position && sizeSpring.position) {
              animateTransform(
                element,
                comp(
                  rectTx(posSpring.position, sizeSpring.position),
                  map((value) => untransform33([], rect, value)),
                ),
              );
            }
          }
        }
      });
    }
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
        setIndex((index) => index + 1);
      }}
    >
      <Box index={index() + 2} style={{ background: "pink" }} />
      <Box index={index() + 4} style={{ background: "skyblue" }} />
      <Box index={index() + 6} style={{ background: "palegoldenrod" }} />
    </div>
  );
}

interface BoxProps extends ComponentProps<"div"> {
  index: number;
  style?: JSX.CSSProperties;
}

function Box(props: BoxProps) {
  return (
    <div
      class="box"
      style={{
        ...props.style,
        display: "flex",
        "align-items": "center",
        "grid-row-start": areas[props.index % areas.length]?.[0],
        "grid-column-start": areas[props.index % areas.length]?.[1],
      }}
    />
  );
}

// <img
//   src="https://images.unsplash.com/photo-1591350832024-68c7491dd46e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//   style={{ width: "100%", "user-select": "none" }}
// />

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
