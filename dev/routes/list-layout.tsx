import {
  FiCheck,
  FiCornerDownLeft,
  FiCornerDownRight,
  FiX,
} from "solid-icons/fi";
import { Accessor, createSignal, For, Setter, Show } from "solid-js";
import { TaskList } from "~/components/TaskList";
import { TaskListItem } from "~/components/TaskListItem";
import { createSwapList, SwapListStore } from "~/util/createSwapList";
import {
  Matcher,
  useDisposal,
  useUnmounted,
  Zombie,
  ZombieBoundary,
  Zombies,
} from "../../src";
import { createPresenceMatcher } from "../../src/presenceMatcher";

type Variant = "left" | "right";

interface ListItemStore {
  id: number;
  matcher: Matcher<Variant>;
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

  createPresenceMatcher(item.matcher, variant, {
    onEnterSuccess(matchVariant) {
      console.log(`${item.id}: Enter ${variant} from ${matchVariant}`);
    },
    onEnterFailure() {
      console.log(`${item.id}: Enter`);
    },
    onExitSuccess(matchVariant) {
      console.log(`${item.id}: Exit ${variant} to ${matchVariant}`);
    },
    onExitFailure() {
      console.log(`${item.id}: Exit`);
    },
  });

  return (
    <TaskListItem as="li" label={`Item ${item.id}`}>
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
