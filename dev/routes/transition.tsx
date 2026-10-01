import { TaskList } from "../components/TaskList";
import { TaskListItem } from "../components/TaskListItem";
import { createSignal, For } from "solid-js";

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
    <TaskList>
      <button onClick={add}>Add</button>
      <For each={list()}>{(item) => <Item {...item} remove={remove} />}</For>
    </TaskList>
  );
}

interface ItemProps {
  id: number;
  remove: (id: number) => void;
}

function Item(props: ItemProps) {
  return (
    <TaskListItem>
      <span>{props.id}</span>
      <button onClick={[props.remove, props.id]}>X</button>
    </TaskListItem>
  );
}
