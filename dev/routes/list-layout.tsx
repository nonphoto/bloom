import { Accessor, createSignal, Setter } from "solid-js";

export default function ListLayoutRoute() {
  let lastId = 0;
  const [idsA, setIdsA] = createSignal<number[]>([]);
  const [idsB, setIdsB] = createSignal<number[]>([]);

  function deleteId(id: number, setIds: Setter<number[]>) {
    setIds((ids) => ids.filter((filterId) => id != filterId));
  }

  function addId(id: number, setIds: Setter<number[]>) {
    setIds((ids) => [...ids, id]);
  }

  return (
    <div style={{ display: "flex" }}>
      <List
        ids={idsA}
        addId={() => addId(lastId++, setIdsA)}
        deleteId={(id) => deleteId(id, idsA)}
        swapId={(id) => {
          deleteId(id, idsA);
          addId(id, idsB);
        }}
      />
      <List
        ids={idsB}
        addId={() => addId(lastId++, setIdsB)}
        deleteId={(id) => deleteId(id, idsB)}
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
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "0.5em",
        width: "10em",
      }}
    >
      <ul
        style={{
          display: "flex",
          "flex-direction": "column",
          padding: 0,
          gap: "0.5em",
        }}
      >
        {ids().map((id) => (
          <li
            style={{
              display: "flex",
              background: "#eee",
              padding: "0.25em 0.5em",
              border: "solid 1px gray",
              "justify-content": "space-between",
              gap: "0.5em",
            }}
          >
            <div>Item {id}</div>
            <button onClick={[deleteId, id]}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={addId}>Add Item</button>
    </div>
  );
}
