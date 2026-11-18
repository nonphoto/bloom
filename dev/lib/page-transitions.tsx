import { createContext, ParentProps, createSignal, onSettled } from "solid-js";
import { respond } from "@solidjs/web";
import { waitForTimeout } from "../../src/batcher";

interface PageTransitionContextValue {
  setElement: (value: HTMLElement | undefined) => void;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const [element, setElement] = createSignal<HTMLElement>();

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
