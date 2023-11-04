import { useEffect, useRef, useState } from "react";

import { useCursors } from "@ably/spaces/dist/mjs/react";
import { Rnd } from "react-rnd";
import { useChannel } from "ably/react";
// import Mermaid from "./MermaidComponent";
import example from "./example";

import io from "socket.io-client";

const socket = io.connect("https://collabpad-edeb76c1f5ec.herokuapp.com");
const iceCandidateQueue = [];


function VideoComponent(props) {
  const { set } = useCursors();

  const [localX, setLocalX] = useState(0);
  const [localY, setLocalY] = useState(0);
  const [remoteX, setRemoteX] = useState(0);
  const [remoteY, setRemoteY] = useState(0);
  const [local, setLocal] = useState({ width: 300, height: 300 });

  const [remote, setRemote] = useState({ width: 300, height: 300 });
  let isOfferSent = false;
  let isOfferReceived = false;

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef();
  // const { channel }  = useChannel("channel-name", (message) => {
  //     // console.log("Received message:", message);
  // });

  useEffect(() => {
    if (props.isScreenShare) {
      console.log("screen share");
      navigator.mediaDevices.getDisplayMedia({ cursor: true });
    }
  }, []);

  useEffect(() => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    pcRef.current = new RTCPeerConnection(configuration);

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate.toJSON());
        // channel.publish("candidate", event.candidate.toJSON());
      }
    };

    pcRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

   socket.on("offer", async (offer) => {
  const remoteOffer = new RTCSessionDescription(offer);
  await pcRef.current.setRemoteDescription(remoteOffer);
  // After setting the remote description, add queued ICE candidates.
  while (iceCandidateQueue.length > 0) {
    const candidate = iceCandidateQueue.shift();
    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  }
  const answer = await pcRef.current.createAnswer();
  await pcRef.current.setLocalDescription(answer);
  socket.emit("answer", answer.toJSON());
});


    // channel.subscribe("offer", async (offer) => {
    //     if (isOfferReceived || isOfferSent) {
    //         return;
    //     }
    //     console.log('Received offer:', offer.data);
    //     const remoteOffer = new RTCSessionDescription(offer.data);
    //     await pcRef.current.setRemoteDescription(remoteOffer);
    //     const answer = await pcRef.current.createAnswer();
    //     await pcRef.current.setLocalDescription(answer);
    //     channel.publish("answer", answer.toJSON());
    // }
    // );

    socket.on("answer", async (answer) => {
      const remoteAnswer = new RTCSessionDescription(answer);
      try {
        await pcRef.current.setRemoteDescription(remoteAnswer);
      } catch (error) {
        console.error(error);
      }
    });

    // channel.subscribe("answer", async (answer) => {
    //     console.log('Received answer:', answer.data);
    //     const remoteAnswer = new RTCSessionDescription(answer.data);
    //     try {
    //         await pcRef.current.setRemoteDescription(remoteAnswer);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // });

 socket.on("candidate", (candidate) => {
  if (pcRef.current.remoteDescription) {
    pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    // Queue the candidate if the remote description is not yet set.
    iceCandidateQueue.push(candidate);
  }
});

    // channel.subscribe("candidate", (candidate) => {
    //     pcRef.current.addIceCandidate(new RTCIceCandidate(candidate.data));
    // }
    // );

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream
          .getTracks()
          .forEach((track) => pcRef.current.addTrack(track, stream));
        createOffer();
      });
  }, []);

  const createOffer = async () => {
    if (isOfferSent || isOfferReceived) {
      return;
    }
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    isOfferSent = true;
    // channel.publish("offer", offer.toJSON());
    socket.emit("offer", offer.toJSON());
  };

  const { cursors } = useCursors({ returnCursors: true });

  useEffect(() => {
    for (let cursor in cursors) {
      if (cursors[cursor].cursorUpdate.data.type === "video-l") {

        setLocalX(cursors[cursor].cursorUpdate.position.x);
        setLocalY(cursors[cursor].cursorUpdate.position.y);
        setLocal({
          height: cursors[cursor].cursorUpdate.data.height,
          width: cursors[cursor].cursorUpdate.data.width,
        });
      } else if (cursors[cursor].cursorUpdate.data.type === "video-r") {
      
        setRemoteX(cursors[cursor].cursorUpdate.position.x);
        setRemoteY(cursors[cursor].cursorUpdate.position.y);
        setRemote({
          height: cursors[cursor].cursorUpdate.data.height,
          width: cursors[cursor].cursorUpdate.data.width,
        });
      }
    }
  }, [cursors]);

  // return (
  //     <div>
  //         <video ref={localVideoRef} autoPlay muted style={{ width: '50%' }}></video>
  //         <video ref={remoteVideoRef} autoPlay style={{ width: '50%' }}></video>
  //     </div>
  // );
  return (
    <div className="bg-slate-600">
      <Rnd
        onDragStop={(e, d) => {
          setLocalX(d.x);
          setLocalY(d.y);

          if (set) {
            set({
              position: { x: d.x, y: d.y },
              data: {
                state: "move",
                type: "video-l",
                height: local.height,
                width: local.width,
              },
            });
          }
        }}
        onResize={(e, direction, ref, delta) => {
          setLocal({
            ...local,
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          if (set) {
            set({
              position: { x: localX, y: localY },
              data: {
                state: "move",
                type: "video-l",
                height: local.height,
                width: local.width,
              },
            });
          }
        }}
        size={{ width: local.width, height: local.height }}
        position={{ x: localX, y: localY }}
        minWidth={300}
        minHeight={300}
        maxWidth={600}
        maxHeight={600}
      >
        <div
          className="absolute border border-gray-300 bg-opacity-20 rounded-xl p-0.5 pb-0.6 flex flex-col items-center bg-white"
          id="localVideoWrapper"
        >
          <video
            className="w-full h-full rounded-xl object-cover"
            ref={localVideoRef}
            autoPlay
            muted
            width={local.width}
            height={local.height}
            // style={style}
          ></video>
          <div className="  bg-opacity-50 text-white px-2 rounded-md">
            you
          </div>
        </div>
      </Rnd>

      <br />
      <Rnd
        size={{ width: remote.width, height: remote.height }}
        position={{ x: remoteX, y: remoteY }}
        onDragStop={(e, d) => {
          setRemoteX(d.x);
          setRemoteY(d.y);

          if (set) {
            set({
              position: { x: d.x, y: d.y },
              data: {
                state: "move",
                type: "video-r",
                height: remote.height,
                width: remote.width,
              },
            });
          }
        }}
        onResize={(e, direction, ref, delta) => {
          setRemote({
            ...remote,
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          if (set) {
            set({
              position: { x: localX, y: localY },
              data: {
                state: "move",
                type: "video-r",
                height: remote.height,
                width: remote.width,
              },
            });
          }
        }}
        minWidth={300}
        minHeight={300}
        maxWidth={600}
        maxHeight={600}
      >
        {/* <div id="remoteAudioWrapper">
          <video ref={remoteVideoRef} autoPlay></video>
          <dir>other user</dir>
          <br />
        </div> */}
        <div
                  className="absolute border border-gray-300 bg-opacity-20 rounded-xl p-0.5 pb-0.6 flex flex-col items-center bg-white"

          id="remoteVideoWrapper"
        >
          <video
            className="w-full h-full rounded-xl object-cover"
            ref={remoteVideoRef}
            autoPlay
            width={remote.width}
            height={remote.height}
            // style={style}
          ></video>
          <div className="  bg-opacity-50 text-white px-2 rounded-md">
            other user
          </div>
        </div>
      </Rnd>
    
    </div>
  );
}

export default VideoComponent;
