import { Rnd } from "react-rnd";
import Note from "./note";
import { useCursors } from "@ably/spaces/dist/mjs/react";
import { useEffect, useState } from "react";

function Notes(props) {
  const { set } = useCursors();
  const [X, setX] = useState(0);
  const [Y, setY] = useState(0);
  const [dimension, setDimension] = useState({ width: 300, height: 300 });
  const { cursors } = useCursors({ returnCursors: true });

  useEffect(() => {
    for (let cursor in cursors) {
      if (cursors[cursor].cursorUpdate.data!.id === props.note.id) {

        setX(cursors[cursor].cursorUpdate.position.x);
        setY(cursors[cursor].cursorUpdate.position.y);

        setDimension({
          height: cursors[cursor].cursorUpdate.data!.height as Number,
          width: cursors[cursor].cursorUpdate.data!.width as Number,
        });
      }
    }
  }, [cursors]);

  return (
    <div>
      <Rnd
        // default={{
        //   x: 0,
        //   y: 0,
        //   width: 320,
        //   height: 200,
        // }}
        onDragStop={(e, d) => {
          setX(d.x);
          setY(d.y);

          if (set) {
            set({
              position: { x: d.x, y: d.y },
              data: {
                state: "move",
                type: "notes",
                height: dimension.height,
                width: dimension.width,
                id: props.note.id,
              },
            });
          }
        }}
        onResize={(e, direction, ref, delta) => {
          setDimension({
            ...dimension,
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          if (set) {
            set({
              position: { x: X, y: Y },
              data: {
                state: "move",
                type: "notes",
                height: dimension.height,
                width: dimension.width,
                id: props.note.id,
              },
            });
          }
        }}
        size={{ width: dimension.width, height: dimension.height }}
        position={{ x: X, y: Y }}
        // minWidth={300}
        // minHeight={300}
        // maxWidth={600}
        // maxHeight={600}
      >
        <Note note={props.note} />
      </Rnd>
    </div>
  );
}

export default Notes;
