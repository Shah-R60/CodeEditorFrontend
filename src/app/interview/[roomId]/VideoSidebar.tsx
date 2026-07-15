"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallControls,
  Call,
  useCallStateHooks,
  ParticipantView,
  PaginatedGridLayout
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface VideoSidebarProps {
  token: string;
  apiKey: string;
  userId: string;
  callId: string;
}


export default function VideoSidebar({ token, apiKey, userId, callId }: VideoSidebarProps) {
  const router = useRouter();
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
              <PaginatedGridLayout />
              <div className="border-t border-gray-800 bg-gray-900 pb-2 pt-2">
                <CallControls 
                  onLeave={() => {
                    if (window.confirm("Are you sure you want to end the meeting?")) {
                      router.back();
                    }
                  }} 
                />
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
