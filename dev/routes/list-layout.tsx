import { comp, map } from "@thi.ng/transducers";
import {
  FiCheck,
  FiCornerDownLeft,
  FiCornerDownRight,
  FiX,
} from "solid-icons/fi";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";
import { TaskList } from "~/components/TaskList";
import { TaskListItem } from "~/components/TaskListItem";
import { createSwapList, SwapListStore } from "~/util/createSwapList";
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
import { createEnter } from "../../src/createEnter";
import { createExit } from "../../src/createExit";
import { createRectTransducer } from "../../src/createRectAnimation";

type Variant = "left" | "right";

interface ListItemStore {
  id: number;
  matcher: Matcher<any>;
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
  const unmounted = useUnmounted();
  const dispose = useDisposal();
  const [element, setElement] = createSignal<HTMLElement>();
  const rect = createRect(element);

  createEnter(
    (match) => {
      if (match) {
        console.log(`${item.id}: Enter match`, match.rect()?.pos, rect()?.pos);
        const transform = createRectTransducer(() => rect() ?? match.rect());

        createEffect(() => {
          console.log((rect() ?? match.rect()).size);
        });
        createAnimation(element, () =>
          comp(
            transform(),
            map((transform) => ({ transform: styleTransformMat33(transform) })),
          ),
        );
      } else {
        console.log(`${item.id}: Enter`);
      }
    },
    item.matcher,
    { rect },
  );

  createExit(
    (match) => {
      if (match) {
        console.log(`${item.id}: Exit match`);
      } else {
        console.log(`${item.id}: Exit`);
      }
    },
    item.matcher,
    { rect },
  );

  return (
    <TaskListItem as="li" label={`Item ${item.id}`} ref={setElement}>
      <button
        onClick={[list.swap, item]}
        style={{
          visibility: unmounted() ? "hidden" : "visible",
          "pointer-events": unmounted() ? "none" : "auto",
        }}
      >
        <Show when={variant === "left"} fallback={<FiCornerDownLeft />}>
          <FiCornerDownRight />
        </Show>
      </button>
      <Show
        when={unmounted()}
        fallback={
          <button onClick={[list.delete, item]}>
            <FiX />
          </button>
        }
      >
        <button onClick={dispose}>
          <FiCheck />
        </button>
      </Show>
    </TaskListItem>
  );
}
