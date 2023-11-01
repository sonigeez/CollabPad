import { useChannel } from "ably/react";
import { useEffect, useState } from "react";
import Notes from "./notes";

function NoteComponent() {
  const [notes, setNotes] = useState<any[]>([]);
  const { channel } = useChannel("notes", (message: any) => {

  });
  useEffect(() => {
    const unsubscribe = channel.subscribe("notes", async (message: any) => {


      const newNote = message.data;

      setNotes((prevNotes: any[]) => {
        // Check if the note with the same ID already exists
        const existingNoteIndex = prevNotes.findIndex(note => note.id === newNote.id);

        // If the ID exists, update the note
        if (existingNoteIndex !== -1) {
          const updatedNotes = [...prevNotes];
          updatedNotes[existingNoteIndex].message = newNote.message;
          return updatedNotes;
        }
        // If the ID doesn't exist, add the new note to the array
        return [...prevNotes, newNote];
      });
    });

    return () => {
      unsubscribe();
    };
}, []);

  return (
    <div>
      {notes.map((note: any) => (
        <div>
          <Notes note={note} key={note.id} />
        </div>
      ))}
    </div>
  );
}

export default NoteComponent;
