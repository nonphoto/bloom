import classes from "./BorderBoxExample.module.css";
import BorderBox from "./BorderBox";

export default function BorderBoxExample() {
  return (
    <BorderBox
      class={classes.box}
      borderRadius={50}
      borderWidth={10}
      borderStyle="solid turquoise"
    />
  );
}
