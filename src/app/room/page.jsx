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

  const handleLeaves = async () => {
    try {
      await fetch(`/api/room`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: room }),
      });
      setJoined(false);
      setToken("");
    } catch (e) {
      console.error(e);
    }
  };

  

  useEffect(() => {
    const handleLeave = async () => {
      try {
        await fetch(`/api/room`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomId: room }),
        });
        setJoined(false);
        setToken("");
      } catch (e) {
        console.error(e);
      }
    };
  
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    };
  
    if (joined) {
      // Setup beforeunload event listener
      window.addEventListener('beforeunload', handleLeave);
      // Setup event listener for visibility change
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  
    return () => {
      // Cleanup: Remove beforeunload event listener
      window.removeEventListener('beforeunload', handleLeave);
      // Cleanup: Remove event listener for visibility change
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Call handleLeave function to ensure user leaves the room
      if (joined && document.visibilityState === 'hidden') {
        handleLeave();
      }
    };
  }, [joined, room]);
  

  const handleJoin = async () => {
    try {
      const roomResponse = await fetch(`/api/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const roomData = await roomResponse.json();
      const roomId = roomData.roomId;
      setRoom(roomId);

      let c = `user_${Math.round(Math.random() * 1000000).toString()}`;
      setName(c);

      const tokenResponse = await fetch(`/api/get-participant-token?room=${roomId}&username=${c}`);
      const tokenData = await tokenResponse.json();
      setToken(tokenData.token);
      setJoined(true);
    } catch (e) {
      console.error('Error:', e);
    }
  };

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
      style={{ height: '100dvh' }}
      onDisconnected={handleLeaves}
    >
      <VideoConference
        chatMessageFormatter={formatChatMessageLinks}
        SettingsComponent={SettingsMenu}
        onChange={e=>console.log(e)}
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
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
