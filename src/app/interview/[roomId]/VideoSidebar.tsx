"use client";

import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface VideoSidebarProps {
  token: string;
  serverUrl: string;
}

function MyVideoLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-950">
      <style>{`
        /* Force videos to maintain aspect ratio and not crop */
        .lk-participant-tile video {
          object-fit: contain !important;
        }
        /* Add gap and rounded corners like Zoom */
        .lk-grid-layout {
          gap: 12px !important;
          padding: 12px !important;
        }
        .lk-participant-tile {
          border-radius: 8px !important;
          background-color: #111 !important;
          overflow: hidden !important;
          border: 1px solid #333 !important;
        }
        /* Fix the control bar cut-off issue */
        .lk-control-bar {
          margin-bottom: 8px;
        }
      `}</style>

      {/* Video Grid Area */}
      <div className="flex-1 overflow-hidden relative">
        <GridLayout tracks={tracks} style={{ height: '100%', width: '100%' }}>
          <ParticipantTile />
        </GridLayout>
      </div>
      
      {/* Minimal Control Bar Area */}
      <div className="shrink-0 flex justify-center py-2 bg-gray-950 border-t border-gray-800">
        <ControlBar variation="minimal" controls={{ chat: false }} />
      </div>
    </div>
  );
}

export default function VideoSidebar({ token, serverUrl }: VideoSidebarProps) {
  const router = useRouter();

  if (!token || !serverUrl) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-950 items-center justify-center p-6 text-center">
        <div className="text-sm text-gray-500 animate-pulse">Connecting to video...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-950 relative overflow-hidden">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        className="flex flex-col h-full w-full overflow-hidden"
        onDisconnected={() => {
          if (window.confirm("Are you sure you want to exit the interview room?")) {
            router.back();
          }
        }}
      >
        <MyVideoLayout />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
