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
import { isServer, respond } from "@solidjs/web";
import {
  createBatchedGetRect,
  createRect,
  createTransformAnimation,
  waitForTimeout,
} from "../../src";
import { createRectTransducer } from "../../src/createRectAnimation";

interface PageTransitionContextValue {
  setElement: (value: HTMLElement | undefined) => void;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const [element, setElement] = createSignal<HTMLElement>();
  const getRect = createBatchedGetRect(document.documentElement);
  const rect = createRect(getRect, element);

  // TODO: Is it possible to remove optional types from memos that don't depend
  // on HTMLElement directly?
  const transform = createRectTransducer(rect, { damping, stiffness });
  createTransformAnimation(element, transform);

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

const pages: { name: string; backgroundColor: string }[] = [
  {
    name: "alpha",
    backgroundColor: "lightpink",
  },
  {
    name: "bravo",
    backgroundColor: "skyblue",
  },
  {
    name: "charlie",
    backgroundColor: "lightgoldenrodyellow",
  },
  {
    name: "delta",
    backgroundColor: "palegreen",
  },
  {
    name: "echo",
    backgroundColor: "lavender",
  },
];

export async function fetchAllPages() {
  "use server";
  await waitForTimeout(500);
  return pages;
}

export async function fetchPage(name: string) {
  "use server";
  await waitForTimeout(500);
  const page = pages.find((page) => page.name === name);
  if (page) {
    return respond(page);
  } else {
    throw respond("Page not found", { status: 404 });
  }
}
