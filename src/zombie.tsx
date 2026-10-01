import { noop } from "@solid-primitives/utils";
import type { Accessor, ParentProps } from "solid-js";
import {
  createContext,
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  useContext,
} from "solid-js";
import { JSX } from "@solidjs/web";

function createDetachedRootWithContext<T>(fn: (dispose: () => void) => T) {
  const owner = getOwner();
  return runWithOwner(null, () =>
    createRoot((dispose) => {
      const rootOwner = getOwner();
      if (rootOwner && owner) {
        rootOwner._context = owner._context;
      }
      return fn(dispose);
    }),
  );
}

interface ZombieBoundaryContextValue {
  unmounted: Accessor<boolean>;
  unmountedChildren: Accessor<JSX.Element[]>;
  addUnmountedChild: (jsx: JSX.Element) => () => void;
}

interface ZombieContextValue {
  unmounted: Accessor<boolean>;
  dispose: () => void;
}

const ZombieBoundaryContext = createContext<ZombieBoundaryContextValue>();
const ZombieContext = createContext<ZombieContextValue>();

export function useDispose(): () => void {
  const context = useContext(ZombieContext);
  return context?.dispose ?? noop;
}

export function useUnmounted(): Accessor<boolean> {
  const context = useContext(ZombieContext);
  return () => context?.unmounted() ?? false;
}

export function ZombieBoundary(props: ParentProps) {
  const [unmounted, setUnmounted] = createSignal(false);
  const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>(
    [],
  );

  onCleanup(() => {
    setUnmounted(true);
  });

  const context: ZombieBoundaryContextValue = {
    unmounted,
    unmountedChildren,
    addUnmountedChild: (jsx) => {
      setUnmountedChildren((prev) => [...prev, jsx]);
      return () => {
        setUnmountedChildren((prev) => prev.filter((item) => item !== jsx));
      };
    },
  };

  return (
    <ZombieBoundaryContext value={context}>
      {props.children}
    </ZombieBoundaryContext>
  );
}

export function Zombies() {
  const zombieBoundary = useContext(ZombieBoundaryContext);
  if (!zombieBoundary) {
    throw new Error("Zombies must appear within ZombieBoundary");
  }
  return <>{zombieBoundary.unmountedChildren}</>;
}

export function Zombie(props: ParentProps) {
  const boundary = useContext(ZombieBoundaryContext);

  let removeUnmountedChild: (() => void) | undefined;

  const [jsx, onUnmount] = createDetachedRootWithContext((disposeRoot) => {
    const [unmounted, setUnmounted] = createSignal(false);

    const dispose = () => {
      removeUnmountedChild?.();
      disposeRoot();
    };

    const onUnmount = () =>
      runWithOwner(null, () => {
        removeUnmountedChild = boundary?.addUnmountedChild(jsx);
        setUnmounted(true);
      });

    createEffect(
      () => boundary?.unmounted(),
      (unmounted) => (unmounted ? dispose() : undefined),
    );

    return [
      <ZombieContext
        value={{
          unmounted,
          dispose,
        }}
      >
        {props.children}
      </ZombieContext>,
      onUnmount,
    ];
  });

  onCleanup(onUnmount);

  return jsx;
}
