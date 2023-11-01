import { useMemo, useRef, useEffect, useState } from "react";
import { useMembers, useSpace } from "@ably/spaces/react";
import { mockNames } from "../utils/mockNames";
import { colours } from "../utils/helpers";
import { useChannel } from "ably/react";
import { MemberCursors, YourCursor } from "./Cursors";
import { nanoid } from "nanoid";






import type { Member } from "../utils/types";

import {
  FloatingMenu,
  MainButton,
  ChildButton,
  Directions,
} from "react-floating-button-menu";


import VideoComponent from "./VideoComponent";
import Notes from "./notes";
import NoteComponent from "./NoteComponent";
import { Rnd } from "react-rnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrosshairs, faPen, faPlus, faShare, faXmark } from "@fortawesome/free-solid-svg-icons";
import Particles from "./Particls";


/** 💡 Select a mock name to assign randomly to a new user that enters the space💡 */
const mockName = () => mockNames[Math.floor(Math.random() * mockNames.length)];

const LiveCursors = () => {
  const name = useMemo(mockName, []);
  /** 💡 Select a color to assign randomly to a new user that enters the space💡 */
  const userColors = useMemo(
    () => colours[Math.floor(Math.random() * colours.length)],
    []
  );

  /** 💡 Get a handle on a space instance 💡 */
  const { space } = useSpace();

  useEffect(() => {
    space?.enter({ name, userColors });
  }, [space]);

  const { self } = useMembers();

  const liveCursors = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);

  const { channel } = useChannel("notes", (message: any) => {});

  function solid(arg0: string): import("@fortawesome/fontawesome-svg-core").IconProp {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      id="live-cursors"
      ref={liveCursors}
      className="live-cursors-container cursor-none example-container bg-black"
    >
          <Particles className="absolute inset-0 pointer-events-none" />

      <YourCursor self={self as Member | null} parentRef={liveCursors} />
      <MemberCursors />
      <VideoComponent isScreenShare={isScreenShare} />
      <NoteComponent />



      <div className=" absolute bottom-10 right-10">
        <FloatingMenu
          slideSpeed={500}
          isOpen={isOpen}
          spacing={20}
          direction={Directions.Up}
          // className="menu-btn"
        >
          <MainButton
            isOpen={isOpen}
            iconResting={<FontAwesomeIcon icon={faPlus} />}
            iconActive={<FontAwesomeIcon icon={faXmark} />}
            background="white"
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            size={56}
          />
          <ChildButton
            icon={<FontAwesomeIcon icon={faPen} />}
            onClick={() => {
              channel.publish("notes", {
                message: "Write something...",
                id: nanoid(),
              });
            }}
            background="white"
            size={40}
          />
          <ChildButton
            icon={<FontAwesomeIcon icon={faShare} />}
            background="white"
            onClick={() => {

              setIsScreenShare((prev) => !prev);
            }}
            size={40}
          />
          <ChildButton
            icon={<FontAwesomeIcon icon={faCrosshairs} />}
            background="white"
            onClick={
              () => {

                channel.publish("whiteboard", {
                  id: nanoid(),
                });
              }
            }
            size={40}
          />
        </FloatingMenu>
      </div>
    </div>
  );
};

export default LiveCursors;
