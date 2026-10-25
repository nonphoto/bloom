import { Rect } from "@thi.ng/geom";
import {
  createContext,
  createRoot,
  onCleanup,
  ParentProps,
  runWithOwner,
  type Setter,
  type Accessor,
  createSignal,
} from "solid-js";
import { Matcher } from "../../src/matcher";
import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { isServer } from "@solidjs/web";
import {
  afterGetRect,
  Batcher,
  beforeGetRect,
  BeforeGetRectReturn,
  createAnimation,
  createRect,
  styleTransformMat33,
  waitForTimeout,
} from "../../src";
import { createRectTransducer } from "../../src/createRectAnimation";
import { comp, map } from "@thi.ng/transducers";

type PageTransitionMatch = { rect?: Rect };

interface PageTransitionContextValue {
  matcher: Matcher<PageTransitionMatch>;
  batcher: Batcher;
  element: Accessor<HTMLElement | undefined>;
  setElement: Setter<HTMLElement | undefined>;
  rect: Accessor<Rect | undefined>;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const matcher = new Matcher<PageTransitionMatch>();
  const batcher = new Batcher();
  let beforeGetRectReturn: BeforeGetRectReturn | null = null;

  batcher.addEventListener("first-enqueue", () => {
    beforeGetRectReturn = beforeGetRect(document.body);
  });

  batcher.addEventListener("postrun", () => {
    if (beforeGetRectReturn) {
      afterGetRect(document.body, beforeGetRectReturn);
    }
    matcher.flush();
  });

  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(element);
  const transform = createRectTransducer(rect, { damping, stiffness });

  createAnimation(element, () =>
    comp(
      transform(),
      map((transform) => ({ transform: styleTransformMat33(transform) })),
    ),
  );

  return (
    <PageTransitionContext
      value={{ matcher, batcher, element, setElement, rect }}
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
  if (!isServer) {
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
}

export async function getName(name: string) {
  await waitForTimeout(5);
  return name;
}
