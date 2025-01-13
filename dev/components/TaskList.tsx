import { Polymorphic, PolymorphicProps } from "@kobalte/core";
import { ValidComponent } from "solid-js";

export interface TaskListProps {}

export function TaskList<T extends ValidComponent>(
  props: PolymorphicProps<T, TaskListProps>,
) {
  return (
    <Polymorphic
      as="div"
      {...props}
      style={{
        ...props.style,
        display: "flex",
        "flex-direction": "column",
        gap: "0.5em",
        width: "10em",
      }}
    />
  );
}
