"use client";

import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  useTracks,
  VideoConference,
  formatChatMessageLinks,
  SettingsMenu,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

export default function Page() {
  const [roomId, setRoomId] = useState("");
  const [token, setToken] = useState("");
  const [joined, setJoined] = useState(false);

  // Generate a random user ID
  const userId = `user_${Math.random().toString(36).substr(2, 9)}`;

  const handleJoin = async () => {
    try {
      // Fetch or create a room and get the token
      const roomResponse = await fetch(`/api/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ }),
      });
      const roomData = await roomResponse.json();
      const roomId = roomData.roomId;
      setRoomId(roomId);

      const tokenResponse = await fetch(
        `/api/get-participant-token?room=${roomId}&username=${userId}`
      );
      const tokenData = await tokenResponse.json();
      setToken(tokenData.token);
      setJoined(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeave = async () => {
    try {
      await fetch(`/api/room`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId : parseInt(roomId) }),
      });
      setJoined(false);
      setToken("");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      handleLeave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleLeave();
    };
  }, [roomId]);

  if (!joined) {
    return (
      <div>
        <button onClick={handleJoin}>Join Room</button>
      </div>
    );
  }

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <VideoConference
        chatMessageFormatter={formatChatMessageLinks}
        SettingsComponent={SettingsMenu}
      />
      <button onClick={handleLeave} style={{ position: "absolute", top: 10, right: 10 }}>
        Leave Room
      </button>
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
      <ParticipantTile />
    </GridLayout>
  );
}
