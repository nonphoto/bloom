import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { Rect } from "@thi.ng/geom";
import { comp, map } from "@thi.ng/transducers";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";
import { TaskList } from "../components/TaskList";
import { TaskListItem } from "../components/TaskListItem";
import { createSwapList, SwapListStore } from "../util/createSwapList";
import {
  createAnimation,
  createRect,
  Matcher,
  styleTransformMat33,
  useDisposal,
  useUnmounted,
  Zombie,
  ZombieBoundary,
  Zombies,
} from "../../src";
import { createEnterSubRoot, createExitSubRoot } from "../../src/createEnter";
import { createRectTransducer } from "../../src/createRectAnimation";

type Variant = "left" | "right";

interface ListItemStore {
  id: number;
  matcher: Matcher<{ rect: Accessor<Rect | undefined> }>;
}

export default function MatcherRoute() {
  const [listA, listB] = createSwapList<ListItemStore>();
  const [currentId, setCurrentId] = createSignal(0);

  return (
    <ZombieBoundary>
      <div style={{ display: "flex", gap: "1em", padding: "1em" }}>
        <List
          list={listA}
          currentId={currentId}
          setCurrentId={setCurrentId}
          variant="left"
        />
        <List
          list={listB}
          currentId={currentId}
          setCurrentId={setCurrentId}
          variant="right"
        />
        <TaskList>
          <Zombies />
        </TaskList>
      </div>
    </ZombieBoundary>
  );
}

function List({
  list,
  currentId,
  setCurrentId,
  variant,
}: {
  list: SwapListStore<ListItemStore>;
  currentId: Accessor<number>;
  setCurrentId: Setter<number>;
  variant: Variant;
}) {
  const add = () => {
    list.add({ id: currentId(), matcher: new Matcher() });
    setCurrentId((id) => id + 1);
  };
  return (
    <TaskList>
      <ul style={{ display: "contents" }}>
        <For each={list.items()}>
          {(item) => (
            <Zombie>
              <ListItem item={item} list={list} variant={variant} />
            </Zombie>
          )}
        </For>
      </ul>
      <button onClick={add}>Add Item</button>
    </TaskList>
  );
}

function ListItem({
  list,
  item,
  variant,
}: {
  list: SwapListStore<ListItemStore>;
  item: ListItemStore;
  variant: Variant;
}) {
  const isUnmounted = useUnmounted();
  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(element);

  createEffect(
    () => rect(),
    (rect) => {
      console.log("update rect", rect?.pos);
    },
  );

  createEnterSubRoot(
    (exit) => {
      console.log(`${item.id}: Enter match`);
      const damping = dampingFromHalflife(200);
      const stiffness = stiffnessFromDamping(0.8, damping);
      const transform = createRectTransducer(() => rect() ?? exit.rect(), {
        damping,
        stiffness,
      });
      createEffect(
        () => rect(),
        (rect) => {
          console.log("rect", rect ?? exit.rect());
        },
      );
      createAnimation(element, () =>
        comp(
          transform(),
          map((transform) => ({ transform: styleTransformMat33(transform) })),
        ),
      );
    },
    () => {
      console.log(`${item.id}: Enter`);
    },
    item.matcher,
    { rect },
  );

  createEffect(
    () => isUnmounted(),
    (isUnmounted) => {
      if (isUnmounted) {
        createExitSubRoot(
          () => {
            console.log(`${item.id}: Exit match`);
          },
          () => {
            console.log(`${item.id}: Exit`);
          },
          item.matcher,
          { rect },
        );
      }
    },
  );

  return (
    <TaskListItem label={`Item ${item.id}`} ref={setElement}>
      <button onClick={[list.swap, item]}>
        <Show when={variant === "left"} fallback={<span>{"<"}</span>}>
          <span>{">"}</span>
        </Show>
      </button>
      <button onClick={[list.delete, item]}>
        <span>X</span>
      </button>
    </TaskListItem>
  );
}
