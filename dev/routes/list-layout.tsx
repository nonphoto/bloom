import {
  FiCornerDownLeft,
  FiCornerDownRight,
  FiDelete,
  FiX,
} from "solid-icons/fi";
import { Accessor, createSignal, For, Setter, Show } from "solid-js";
import { TaskList } from "~/components/TaskList";
import { TaskListItem } from "~/components/TaskListItem";
import { Zombie, ZombieBoundary } from "../../src";

export default function ZombieRoute() {
  let lastId = 0;
  const [idsA, setIdsA] = createSignal<number[]>([]);
  const [idsB, setIdsB] = createSignal<number[]>([]);

  function deleteId(id: number, setIds: Setter<number[]>) {
    setIds((ids) => ids.filter((filterId) => id != filterId));
  }

  function addId(id: number, setIds: Setter<number[]>) {
    setIds((ids) => [...ids, id++]);
  }

  return (
    <ZombieBoundary>
      {(zombies) => (
        <div
          style={{
            display: "flex",
            gap: "1em",
            padding: "1em",
            "align-items": "start",
          }}
        >
          <List
            variant="left"
            ids={idsA}
            addId={() => addId(lastId++, setIdsA)}
            deleteId={(id) => deleteId(id, setIdsA)}
            swapId={(id) => {
              deleteId(id, setIdsA);
              addId(id, setIdsB);
            }}
          />
          <List
            variant="right"
            ids={idsB}
            addId={() => addId(lastId++, setIdsB)}
            deleteId={(id) => deleteId(id, setIdsB)}
            swapId={(id) => {
              deleteId(id, setIdsB);
              addId(id, setIdsA);
            }}
          />
          <TaskList>{zombies()}</TaskList>
        </div>
      )}
    </ZombieBoundary>
  );
}

function List({
  ids,
  addId,
  deleteId,
  swapId,
  variant,
}: {
  ids: Accessor<number[]>;
  addId: () => void;
  deleteId: (id: number) => void;
  swapId: (id: number) => void;
  variant: "left" | "right";
}) {
  return (
    <TaskList>
      <ul style={{ display: "contents" }}>
        <For each={ids()}>
          {(id) => (
            <Zombie>
              {(unmounted, dispose) => (
                <TaskListItem as="li" label={`Item ${id}`}>
                  <button onClick={[swapId, id]}>
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
                      <button onClick={[deleteId, id]}>
                        <FiX />
                      </button>
                    }
                  >
                    <button onClick={dispose}>
                      <FiDelete />
                    </button>
                  </Show>
                </TaskListItem>
              )}
            </Zombie>
          )}
        </For>
      </ul>
      <button onClick={addId}>Add Item</button>
    </TaskList>
  );
}
