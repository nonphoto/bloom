import {
  createContext,
  createRoot,
  onCleanup,
  ParentProps,
  runWithOwner,
  createSignal,
  onSettled,
} from "solid-js";
import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { isServer } from "@solidjs/web";
import {
  createAnimation,
  createRect,
  styleTransformMat33,
  waitForTimeout,
} from "../../src";
import { createRectTransducer } from "../../src/createRectAnimation";
import { comp, map } from "@thi.ng/transducers";

interface PageTransitionContextValue {
  setElement: (value: HTMLElement | undefined) => void;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(element);
  const transform = createRectTransducer(rect, { damping, stiffness });

  createAnimation(element, () => {
    performance.mark("createAnimation");
    return comp(
      transform(),
      map((transform) => ({ transform: styleTransformMat33(transform) })),
    );
  });

  const setElementOnSettled: PageTransitionContextValue["setElement"] = (
    ...args
  ) => {
    onSettled(() => {
      setElement(...args);
    });
  };

  return (
    <PageTransitionContext
      value={{
        setElement: setElementOnSettled,
      }}
    >
      {props.children}
    </PageTransitionContext>
  );
}

const damping = dampingFromHalflife(200);
const stiffness = stiffnessFromDamping(1, damping);

export const springOptions = {
  damping,
  stiffness,
};

export interface CreateZombieOptions {
  mount?: Element;
}

export function createZombie(
  element: MaybeAccessor<Element | null | undefined>,
  callback: (zombie: Node, dispose: () => void) => void,
  options?: CreateZombieOptions,
) {
  if (isServer) return;

  onCleanup(() => {
    runWithOwner(null, () =>
      createRoot((dispose) => {
        const elementValue = access(element);
        if (elementValue) {
          const zombie = elementValue.cloneNode(true);
          if (zombie instanceof HTMLElement) {
            zombie.inert = true;
          }

          const mount = options?.mount ?? document.body;
          mount.appendChild(zombie);

          onCleanup(() => {
            mount.removeChild(zombie);
          });

          callback(zombie, dispose);
        }
      }),
    );
  });
}

export async function getName(name: string) {
  await waitForTimeout(500);
  return name;
}
