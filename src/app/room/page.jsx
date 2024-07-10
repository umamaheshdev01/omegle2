'use client'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myqgvtknkeilmcxriqhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cWd2dGtua2VpbG1jeHJpcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4NTUwODcsImV4cCI6MjAyOTQzMTA4N30.GmiWzn2Lr6fD99UvA69qmS7NyAijGh0Zb_-EGKEXGMY';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [showRoom, setShowRoom] = useState(true);
  const [joining, setJoining] = useState(false); // State for joining process

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  useEffect(() => {
    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room' },
        async (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new.id === room) {
            if (payload.new.members === 1) {
              await refreshPage();
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [room]);

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

  const refreshPage = async () => {
    try {
      setShowRoom(false);

      await fetch(`/api/room`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: room }),
      });
      setToken("");

      setTimeout(() => {
        handleJoin();
      }, 500); // Delay to ensure unmount
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleLeave = async () => {
      try {
        await handleLeaves();
      } catch (e) {
        console.error(e);
      }
    };

    if (joined) {
      window.addEventListener('beforeunload', handleLeave);
    }

    return () => {
      window.removeEventListener('beforeunload', handleLeave);
      if (joined && document.visibilityState === 'hidden') {
        handleLeave();
      }
    };
  }, [joined, room]);

  const handleJoin = async () => {
    try {
      setJoining(true); // Set joining state to true
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
      setShowRoom(true);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setJoining(false); // Reset joining state after join attempt
    }
  };

  if (joining) {
    return <div style={{ textAlign: 'center', marginTop: '50vh' }}>Joining...</div>;
  }

  if (!joined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <button
          onClick={handleJoin}
          style={{
            cursor: 'pointer',
            padding: '20px',
            backgroundColor: '#3498db',
            color: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            width: '200px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          Join Room
        </button>
      </div>
    );
  }

  if (token === "") {
    return <div>Joining a new room dude</div>;
  }

  return (
    <>
      {showRoom && (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={livekitUrl}
          data-lk-theme="default"
          style={{ height: '100dvh' }}
          onDisconnected={handleLeaves}
        >
          <VideoConference
            chatMessageFormatter={formatChatMessageLinks}
            SettingsComponent={SettingsMenu}
          />
        </LiveKitRoom>
      )}
    </>
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
