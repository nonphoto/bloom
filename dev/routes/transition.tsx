import {
  useDisposal,
  useUnmounted,
  Zombie,
  ZombieBoundary,
  Zombies,
} from "../../src";
import { TaskList } from "../components/TaskList";
import { TaskListItem } from "../components/TaskListItem";
import { createSignal, For, createEffect, Show } from "solid-js";

export default function TransitionRoute() {
  const [list, setList] = createSignal<Pick<ItemProps, "id">[]>([]);

  const add = () => {
    setList((list) => [
      ...list,
      {
        id: list.map((item) => item.id).reduce((a, b) => Math.max(a, b), 0) + 1,
      },
    ]);
  };

  const remove = (id: number) => {
    setList((list) => list.filter((item) => item.id !== id));
  };

  return (
    <ZombieBoundary>
      <TaskList>
        <button onClick={add}>Add</button>
        <For each={list()}>{(item) => <Item {...item} remove={remove} />}</For>
      </TaskList>
      <TaskList style={{ "margin-block-start": "1rem" }}>
        <Zombies />
      </TaskList>
    </ZombieBoundary>
  );
}

interface ItemProps {
  id: number;
  remove: (id: number) => void;
}

function Item(props: ItemProps) {
  return (
    <Zombie>
      {(() => {
        const isUnmounted = useUnmounted();
        const dispose = useDisposal();

        return (
          <TaskListItem
            style={{ background: isUnmounted() ? "lightpink" : undefined }}
          >
            <span>{props.id}</span>
            <Show
              when={!isUnmounted()}
              fallback={<button onClick={dispose}>?</button>}
            >
              <button onClick={[props.remove, props.id]}>X</button>
            </Show>
          </TaskListItem>
        );
      })()}
    </Zombie>
  );
}
