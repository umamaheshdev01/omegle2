"use client";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  VideoConference,
  formatChatMessageLinks,
  SettingsMenu
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

export default function Page() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    try {
      const resp = await fetch(
        `/api/get-participant-token?room=${room}&username=${name}`
      );
      const data = await resp.json();
      setToken(data.token);
      setJoined(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (!joined) {
    return (
      <div>
        <input
          type="text"
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
      style={{ height: '100dvh' }}
    >
      <VideoConference
        chatMessageFormatter={formatChatMessageLinks}
        SettingsComponent={SettingsMenu}
      />
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
