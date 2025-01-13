import { FiX, FiXCircle } from "solid-icons/fi";
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
    <div style={{ display: "flex", gap: "1em", padding: "1em" }}>
      <List
        ids={idsA}
        addId={() => addId(lastId++, setIdsA)}
        deleteId={(id) => deleteId(id, setIdsA)}
        swapId={(id) => {
          deleteId(id, idsA);
          addId(id, idsB);
        }}
      />
      <List
        ids={idsB}
        addId={() => addId(lastId++, setIdsB)}
        deleteId={(id) => deleteId(id, setIdsB)}
        swapId={(id) => {
          deleteId(id, idsB);
          addId(id, idsA);
        }}
      />
    </div>
  );
}

function List({
  ids,
  addId,
  deleteId,
}: {
  ids: Accessor<number[]>;
  addId: () => void;
  deleteId: (id: number) => void;
  swapId: (id: number) => void;
}) {
  return (
    <ZombieBoundary>
      {(zombies) => (
        <TaskList>
          <ul style={{ display: "contents" }}>
            <For each={ids()}>
              {(id) => (
                <Zombie>
                  {(unmounted, dispose) => (
                    <TaskListItem as="li" label={`Item ${id}`}>
                      <Show
                        when={unmounted()}
                        fallback={
                          <button onClick={[deleteId, id]}>
                            <FiX />
                          </button>
                        }
                      >
                        <button onClick={dispose}>
                          <FiXCircle />
                        </button>
                      </Show>
                    </TaskListItem>
                  )}
                </Zombie>
              )}
            </For>
          </ul>
          <button onClick={addId}>Add Item</button>
          {zombies()}
        </TaskList>
      )}
    </ZombieBoundary>
  );
}
