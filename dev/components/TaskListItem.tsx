import { Polymorphic, PolymorphicProps } from "@kobalte/core";
import { createUniqueId, ValidComponent } from "solid-js";

export interface TaskListItemProps {
  label?: string;
}

export function TaskListItem<T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TaskListItemProps>,
) {
  const id = createUniqueId();
  return (
    <Polymorphic
      as="div"
      {...props}
      style={{
        ...props.style,
        display: "flex",
        background: "#eee",
        padding: "0.25em 0.5em",
        border: "solid 1px gray",
        "justify-content": "space-between",
        gap: "0.5em",
      }}
      aria-labelled-by={id}
    >
      <div id={id}>{props.label}</div>
      {props.children}
    </Polymorphic>
  );
}
