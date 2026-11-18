export function batched<T>(
  callback: (values: T[]) => void,
): (value: T) => void {
  const values = new Set<T>();

  return (value) => {
    if (values.size === 0) {
      queueMicrotask(() => {
        callback([...values.values()]);
        values.clear();
      });
    }
    values.add(value);
  };
}
