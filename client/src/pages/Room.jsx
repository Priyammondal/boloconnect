import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import { Button } from "react-bootstrap";
import peer from "../services/peer";

const Room = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const socket = useSocket();

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("callUser", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      const answer = await peer.getAnswer(offer);
      socket.emit("answerCall", { to: from, answer });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async ({ answer }) => {
      peer.setAnswer(answer);
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  const handleIncomingNegotiation = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peerNegotiationDone", { to: from, answer });
    },
    [socket]
  );

  const handlePeerNegotiationFinal = useCallback(async ({ answer }) => {
    await peer.setAnswer(answer);
  }, []);

  const handleTrack = useCallback((event) => {
    const remoteStream = event.streams[0];
    setRemoteStream(remoteStream);
  }, []);

  const handleNegotionationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("negotiationNeeded", { to: remoteSocketId, offer });
  }, [socket, remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("track", handleTrack);
    peer.peer.addEventListener("negotiationneeded", handleNegotionationNeeded);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotionationNeeded
      );
    };
  }, [handleTrack, handleNegotionationNeeded, remoteSocketId]);

  useEffect(() => {
    socket.on("userJoined", handleUserJoined);
    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("incomingNegotiation", handleIncomingNegotiation);
    socket.on("peerNegotiationFinal", handlePeerNegotiationFinal);
    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("incomingNegotiation", handleIncomingNegotiation);
      socket.off("peerNegotiationFinal", handlePeerNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIncomingNegotiation,
    handlePeerNegotiationFinal,
  ]);

  return (
    <div>
      <h4>{remoteSocketId ? "You are connected" : "No one in the room!"}</h4>
      {remoteSocketId && <Button onClick={handleCallUser}>Call</Button>}
      {myStream && (
        <>
          <h4>My Stream</h4>
          <video
            height="200"
            width="200"
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video) {
                video.srcObject = myStream;
              }
            }}
          />
        </>
      )}

      {remoteStream && (
        <>
          <h4>Remote Stream</h4>
          <video
            height="200"
            width="200"
            autoPlay
            playsInline
            ref={(video) => {
              if (video) {
                video.srcObject = remoteStream;
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default Room;
