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
import { Zombie, ZombieBoundary } from "../../src";

export default function ZombieRoute() {
  const [listA, listB] = createSwapList<number>();
  const [lastId, setLastId] = createSignal(0);

  return (
    <div style={{ display: "flex", gap: "1em", padding: "1em" }}>
      <List list={listA} lastId={lastId} setLastId={setLastId} variant="left" />
      <List
        list={listB}
        lastId={lastId}
        setLastId={setLastId}
        variant="right"
      />
    </div>
  );
}

function List({
  list,
  lastId,
  setLastId,
  variant,
}: {
  list: SwapListStore<number>;
  lastId: Accessor<number>;
  setLastId: Setter<number>;
  variant: "left" | "right";
}) {
  const add = () => {
    list.add(lastId());
    setLastId((id) => id + 1);
  };
  return (
    <ZombieBoundary>
      {(zombies) => (
        <TaskList>
          <ul style={{ display: "contents" }}>
            <For each={list.items()}>
              {(id) => (
                <Zombie>
                  {(unmounted, dispose) => (
                    <TaskListItem as="li" label={`Item ${id}`}>
                      <button onClick={[list.swap, id]}>
                        <Show
                          when={variant === "left"}
                          fallback={<FiCornerDownLeft />}
                        >
                          <FiCornerDownRight />
                        </Show>
                      </button>
                      <Show
                        when={unmounted()}
                        fallback={
                          <button onClick={[list.delete, id]}>
                            <FiX />
                          </button>
                        }
                      >
                        <button onClick={dispose}>
                          <FiCheck />
                        </button>
                      </Show>
                    </TaskListItem>
                  )}
                </Zombie>
              )}
            </For>
          </ul>
          <button onClick={add}>Add Item</button>
          {zombies()}
        </TaskList>
      )}
    </ZombieBoundary>
  );
}
