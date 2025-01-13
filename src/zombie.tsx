import { noop } from "@solid-primitives/utils";
import type { Accessor, JSX } from "solid-js";
import {
  createContext,
  createEffect,
  createRoot,
  createSignal,
  createUniqueId,
  getOwner,
  onCleanup,
  untrack,
  useContext,
} from "solid-js";

type MaybeFunctionChildren<T extends any[]> =
  | ((...args: T) => JSX.Element)
  | JSX.Element;

function createRootWithContext<T>(fn: (dispose: () => void) => T) {
  const owner = getOwner();
  return createRoot((dispose) => {
    const rootOwner = getOwner();
    if (rootOwner && owner) {
      rootOwner.context = owner.context;
    }
    return fn(dispose);
  });
}

interface ZombieBoundaryContextValue {
  unmounted: Accessor<boolean>;
  addUnmountedChild: (jsx: JSX.Element) => () => void;
}

interface ZombieContextValue {
  unmounted: Accessor<boolean>;
  useDisposal: () => () => void;
}

const ZombieBoundaryContext = createContext<ZombieBoundaryContextValue>();
const ZombieContext = createContext<ZombieContextValue>();

export function useDisposal(): () => void {
  const context = useContext(ZombieContext);
  return context?.useDisposal() ?? noop;
}

export function useUnmounted(): Accessor<boolean> {
  const context = useContext(ZombieContext);
  return () => context?.unmounted() ?? false;
}

export function ZombieBoundary(props: {
  children: MaybeFunctionChildren<[Accessor<JSX.Element[]>]>;
}) {
  const [unmounted, setUnmounted] = createSignal(false);
  const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>(
    [],
  );

  onCleanup(() => {
    setUnmounted(true);
  });

  const context: ZombieBoundaryContextValue = {
    unmounted,
    addUnmountedChild: (jsx) => {
      const object = [jsx];
      setUnmountedChildren((prev) => [...prev, object]);
      return () => {
        setUnmountedChildren((prev) => prev.filter((item) => item !== object));
      };
    },
  };

  return (
    <ZombieBoundaryContext.Provider value={context}>
      {typeof props.children === "function"
        ? props.children(unmountedChildren)
        : props.children}
    </ZombieBoundaryContext.Provider>
  );
}

export function Zombie(props: {
  children: MaybeFunctionChildren<[Accessor<boolean>, () => void]>;
}) {
  const boundary = useContext(ZombieBoundaryContext);
  const [unmounted, setUnmounted] = createSignal(false);
  const disposalDeps = new Map<string, boolean>();

  let removeUnmountedChild: (() => void) | undefined;

  const [jsx, dispose] = createRootWithContext((disposeRoot) => {
    const dispose = () => {
      disposeRoot();
      removeUnmountedChild?.();
    };

    const context: ZombieContextValue = {
      unmounted,
      useDisposal: () => {
        const id = createUniqueId();
        disposalDeps.set(id, false);
        onCleanup(() => {
          disposalDeps.delete(id);
        });
        return () => {
          disposalDeps.set(id, true);
          if (
            untrack(unmounted) &&
            Array.from(disposalDeps.values()).every((value) => value)
          ) {
            dispose();
          }
        };
      },
    };

    return [
      <ZombieContext.Provider value={context}>
        {typeof props.children === "function"
          ? props.children(context.unmounted, context.useDisposal())
          : props.children}
      </ZombieContext.Provider>,
      dispose,
    ];
  });

  createEffect(() => {
    if (boundary?.unmounted()) {
      dispose();
    }
  });

  onCleanup(() => {
    setUnmounted(true);
    if (disposalDeps.size > 0) {
      removeUnmountedChild = boundary?.addUnmountedChild(jsx);
    } else {
      dispose();
    }
  });

  return jsx;
}
