import { useState, useEffect } from "react";
import { useChannel } from "ably/react";
import { useMembers } from "@ably/spaces/dist/mjs/react";
function Note(props: any) {
  const [val, setVal] = useState(props.note.message);

  const { channel } = useChannel("notes", (message: any) => {

  });

  useEffect(() => {
    const unsubscribe = channel.subscribe("notes", async (message: any) => {


      const newNote = message.data;
      if (newNote.id !== props.note.id) return;
      setVal(newNote.message);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="  bg-yellow-100  border border-gray-400 h-[310px] w-[310px] flex flex-col items-center rounded-xl p-0.5 pt-0.6 ">
      <div className=" flex text-center items-center">
        <h1>Note</h1>
      </div>

      <textarea
        onChange={(e) => {
          setVal(e.target.value);
          channel.publish("notes", {
            message: e.target.value,
            id: props.note.id,
          });
        }}
        value={val}
        className=" cursive-note bg-yellow-200  h-[300px] w-[300px] resize-none rounded-xl p-1 outline-none "
      />
    </div>
  );
}

export default Note;
