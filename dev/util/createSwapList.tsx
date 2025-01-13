import { Accessor, createSignal, Setter } from "solid-js";

export interface SwapListStore<T> {
  items: Accessor<T[]>;
  add: (item: T) => void;
  delete: (item: T) => void;
  swap: (item: T) => void;
}

export function createSwapList<T>(): [SwapListStore<T>, SwapListStore<T>] {
  const [itemsA, setItemsA] = createSignal<T[]>([]);
  const [itemsB, setItemsB] = createSignal<T[]>([]);

  function deleteItem(item: T, setItems: Setter<T[]>) {
    setItems((items) => items.filter((filterItem) => item !== filterItem));
  }

  function addItem(item: T, setItems: Setter<T[]>) {
    setItems((items) => [...items, item]);
  }

  return [
    {
      items: itemsA,
      add: (item: T) => addItem(item, setItemsA),
      delete: (item: T) => deleteItem(item, setItemsA),
      swap: (item: T) => {
        deleteItem(item, setItemsA);
        addItem(item, setItemsB);
      },
    },
    {
      items: itemsB,
      add: (item: T) => addItem(item, setItemsB),
      delete: (item: T) => deleteItem(item, setItemsB),
      swap: (item: T) => {
        deleteItem(item, setItemsB);
        addItem(item, setItemsA);
      },
    },
  ];
}
