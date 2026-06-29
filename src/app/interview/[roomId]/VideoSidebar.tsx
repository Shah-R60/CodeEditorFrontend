"use client";

import { useEffect, useState } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallControls,
  Call,
  useCallStateHooks,
  ParticipantView
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface VideoSidebarProps {
  token: string;
  apiKey: string;
  userId: string;
  callId: string;
}

const CustomVerticalLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {participants.length === 0 && (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-gray-700 text-sm text-gray-500">
          Waiting for others...
        </div>
      )}
      {participants.map((participant) => (
        <div key={participant.sessionId} className="w-full relative aspect-video rounded-xl bg-gray-800 overflow-hidden border border-gray-700 shadow-md">
          <ParticipantView participant={participant} />
        </div>
      ))}
    </div>
  );
};

export default function VideoSidebar({ token, apiKey, userId, callId }: VideoSidebarProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!token || !apiKey || !userId || !callId) return;

    const user = {
      id: userId,
      name: userId,
    };

    const myClient = new StreamVideoClient({ apiKey, user, token });
    const myCall = myClient.call('default', callId);

    let isMounted = true;
    let joinPromise: Promise<void> | null = null;

    joinPromise = myCall.join({ create: true }).then(() => {
      if (isMounted) {
        setClient(myClient);
        setCall(myCall);
      }
    }).catch((err) => {
      console.error('Failed to join Stream call', err);
    });

    return () => {
      isMounted = false;
      if (joinPromise) {
        joinPromise.then(() => {
          myCall.leave().then(() => {
            myClient.disconnectUser();
          });
        });
      }
    };
  }, [token, apiKey, userId, callId]);

  if (!client || !call) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-950 items-center justify-center p-6 text-center">
        <div className="text-sm text-gray-500 animate-pulse">Connecting to video...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-950 relative">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme className="h-full w-full absolute inset-0">
            <div className="flex-1 h-full w-full flex flex-col overflow-hidden bg-gray-950">
              <CustomVerticalLayout />
              <div className="border-t border-gray-800 bg-gray-900 pb-2 pt-2">
                <CallControls />
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
