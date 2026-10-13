import { Rect } from "@thi.ng/geom";
import {
  createContext,
  createEffect,
  createRoot,
  onCleanup,
  ParentProps,
  runWithOwner,
} from "solid-js";
import { Matcher } from "../../src/matcher";
import { useIsRouting } from "@solidjs/router";
import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { useBeforeLeave } from "@solidjs/router";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { isServer } from "@solidjs/web";
import { waitForTimeout } from "../../src";

type PageTransitionMatch = { rect?: Rect };

interface PageTransitionContextValue {
  matcher: Matcher<PageTransitionMatch>;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const matcher = new Matcher<PageTransitionMatch>();
  const isRouting = useIsRouting();

  createEffect(
    () => isRouting(),
    (isRouting) => {
      console.log("routing", isRouting);
      if (!isRouting) {
        queueMicrotask(() => {
          matcher.flush();
        });
      }
    },
  );

  useBeforeLeave((event) => {
    console.log("before leave");
  });

  return (
    <PageTransitionContext value={{ matcher }}>
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
  await waitForTimeout(1000);
  return name;
}
