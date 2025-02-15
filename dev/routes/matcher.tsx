import { FiCornerDownLeft, FiCornerDownRight, FiX } from "solid-icons/fi";
import { Accessor, createSignal, For, onCleanup, Setter, Show } from "solid-js";
import { TaskList } from "~/components/TaskList";
import { TaskListItem } from "~/components/TaskListItem";
import { createSwapList, SwapListStore } from "~/util/createSwapList";
import { Matcher } from "../../src";

type Variant = "left" | "right";

interface ListItemStore {
  id: number;
  matcher: Matcher<Variant>;
}

export default function MatcherRoute() {
  const [listA, listB] = createSwapList<ListItemStore>();
  const [currentId, setCurrentId] = createSignal(0);

  return (
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
    </div>
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
          {(item) => <ListItem item={item} list={list} variant={variant} />}
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
  item.matcher.attemptEnter(
    variant,
    (matchVariant) => {
      console.log(`${item.id}: Enter ${variant} from ${matchVariant}`);
    },
    () => {
      console.log(`${item.id}: Enter`);
    },
  );

  onCleanup(() => {
    item.matcher.attemptExit(
      variant,
      (matchVariant) => {
        console.log(`${item.id}: Exit ${variant} to ${matchVariant}`);
      },
      () => {
        console.log(`${item.id}: Exit`);
      },
    );
  });

  return (
    <TaskListItem as="li" label={`Item ${item.id}`}>
      <button onClick={[list.swap, item]}>
        <Show when={variant === "left"} fallback={<FiCornerDownLeft />}>
          <FiCornerDownRight />
        </Show>
      </button>
      <button onClick={[list.delete, item]}>
        <FiX />
      </button>
    </TaskListItem>
  );
}
