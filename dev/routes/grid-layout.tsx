import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { comp, map, permutations } from "@thi.ng/transducers";
import { createSignal, onSettled } from "solid-js";
import { Batcher, getRect } from "../../src";
import { TransformController } from "../../src/transformController";
import { rectSpringTx } from "../../src/rectSpring";
import { untransform33 } from "../../src/rect/untransform";
import { SpringController2 } from "../../src/springController";
import { delay } from "../../src/transducer";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];
const damping = dampingFromHalflife(200);
const stiffness = stiffnessFromDamping(1, damping);

export default function GridLayoutRoute() {
  const [index, setIndex] = createSignal(0);
  let element!: HTMLDivElement;

  onSettled(() => {
    const posSpring = new SpringController2(undefined, { stiffness, damping });
    const sizeSpring = new SpringController2(undefined, { stiffness, damping });
    const controller = new TransformController(element);

    const batcher = new Batcher();
    batcher.addEventListener("pre-enqueue", () => {
      controller.disable();
    });
    batcher.addEventListener("post-run", () => {
      controller.enable();
    });

    const observer = new ResizeObserver(() => {
      batcher.enqueue(() => {
        const rect = getRect(element);
        posSpring.next(rect.pos);
        sizeSpring.next(rect.size);
        if (posSpring.spring && sizeSpring.spring) {
          controller.animate(
            comp(
              delay(performance.now()),
              rectSpringTx(posSpring.spring, sizeSpring.spring),
              map((value) => untransform33([], rect, value)),
            ),
          );
        }
      });
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
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
        ref={element}
        style={{
          background: "pink",
          display: "flex",
          "align-items": "center",
          "grid-row-start": areas[index()]?.[0],
          "grid-column-start": areas[index()]?.[1],
        }}
      ></div>
    </div>
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
