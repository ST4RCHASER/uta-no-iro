import HLSPlayer from "@uta/components/hlsPlayer";
import Layout from "@uta/components/layout"
import { useRoom } from "@uta/hooks/useRoom";
import { api } from "@uta/utils/api";
import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import type { FakeYoutubeVideoPlayer, RoomState, Track } from "@uta/types/room.types";

export function Monitor() {
  const room = useRoom()
  const updater = api.rooms.updateRoomState.useMutation();
  const event = api.songs.playerEvent.useMutation();
  const [playerState, setPlayerState] = useState({
    state: 'idle',
    track: null
  } as RoomState);
  const [isReady, setIsReady] = useState(false);
  const [playerRef, setPlayerRef] = useState<FakeYoutubeVideoPlayer>()
  const hlsPlayerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('State changed', playerState);
    if (isReady && room) {
      updater.mutate({
        id: room.id,
        data: {
          ...playerState,
          updatedAt: new Date().getTime()
        }
      })
    }
  }, [JSON.stringify(playerState), isReady])

  useEffect(() => { 
    if (room && room.states !== null && !isReady) { 
      console.log('Setting state', room.states);
      setPlayerState(room.states);
      setIsReady(true);
    } else if (room && room.states === null && !isReady) {
      updater.mutate({
        id: room.id,
        data: {
          ...playerState,
          updatedAt: new Date().getTime()
        }
      })
      setIsReady(true);
    }
  }, [room])

  // Youtube Player
  useEffect(() => {
    console.log('Player ref changed', playerRef?.playerInfo);
    if (playerRef?.playerInfo) { 
      setPlayerState({
        ...playerState,
        currentTime: playerRef?.playerInfo.currentTime,
        duration: playerRef?.playerInfo.duration,
      })
    }
  }, [JSON.stringify(playerRef?.playerInfo)])

  api.songs.onBroadcast.useSubscription({
    roomId: room?.id ?? ''
  }, {
    onData(data: string) {
      const event = (typeof data === 'string' ? JSON.parse(data) : data) as { type: string, payload: Track };
      console.log('Player event', event);
      try {
        switch (event.type) {
          case 'PLAY_TRACK':
            setPlayerState({
              ...playerState,
              state: 'loading',
              track: event.payload 
            });
            break;
          case 'NEXT':
            break;
          case 'SEEK':
            playerRef?.seekTo(event?.payload?.sec ?? 0);
            if (hlsPlayerRef.current) {
              hlsPlayerRef.current.currentTime = event?.payload?.sec ?? 0;
            }
            break;
          case 'RESTART':
            playerRef?.seekTo(0);
            if (hlsPlayerRef.current?.currentTime) {
              hlsPlayerRef.current.currentTime = 0;
            }
            break;
          case 'PLAY':
            playerRef?.playVideo();
            if (hlsPlayerRef.current?.paused) {
              void hlsPlayerRef.current.play();
            }
            break;
          case 'PAUSE':
            playerRef?.pauseVideo();
            if (hlsPlayerRef?.current && !hlsPlayerRef?.current?.paused) {
              hlsPlayerRef.current.pause();
            }
            break;
        }
      } catch (e) {
        console.error('Event failed', e);
      }
    }
  });

  return (
    <>
      <Layout title="Player" description="No queue right please add some song!">
        {JSON.stringify(playerState)}
        {playerState.state !=='idle' && <main className="flex min-h-screen flex-col items-center justify-center">
          <div className="max-w-xl mx-auto p-4">
            {playerState.track && playerState.track.type === 'youtube' && <div className="w-screen h-screen fixed left-0 top-0">
              <YouTube videoId={
                playerState.track.id
              }
                allow="autoplay"
                title={playerState.track.title}
                iframeClassName="w-screen h-screen fixed left-0 top-0"
                onStateChange={(e: {
                  data: number, 
                  target: FakeYoutubeVideoPlayer
                }) => {
                  switch (e.data) { 
                    // 1 - Playing
                    case 1:
                      setPlayerState({
                        ...playerState,
                        state: 'playing'
                      });
                      break;
                    // 2 - Paused
                    case 2:
                      setPlayerState({
                        ...playerState,
                        state: 'paused'
                      });
                      break;
                    // 3 - Buffering
                    case 3:
                      setPlayerState({
                        ...playerState,
                        state: 'loading'
                      });
                      break;
                    // 0 - Ended
                    case 0:
                      setPlayerState({
                        ...playerState,
                        state: 'idle',
                        track: null
                      });
                      break;
                    // -1 - Unstarted
                    case -1:
                      playerRef?.playVideo();
                      break;
                    // 5 - Video cued
                    default:
                      break;
                  }
                  console.log('Youtube state change', e);
                  setPlayerRef(e.target);
                }}
                onReady={(e: {
                  target: FakeYoutubeVideoPlayer
                }) => {
                  e.target.playVideo();
                  setPlayerState({
                    ...playerState,
                    state: 'playing'
                  });
                  event.mutate({
                    roomId: room?.id,
                    event: 'READY'
                  })
                }}
                onEnd={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  event.mutate({
                    roomId: room?.id,
                    event: 'ENDED'
                  })
                }}
                onError={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  event.mutate({
                    roomId: room?.id,
                    event: 'ERROR'
                  })
                }}
                opts={{
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                  },
                }}
              />
            </div>}
            {
              playerState.track && playerState.track.type === 'niconico' && <div >
                <HLSPlayer manifest={`https://nicovrc.net/proxy?https://www.nicovideo.jp${playerState.track.id}`} controls={true} ref={hlsPlayerRef} className="w-screen h-screen fixed left-0 top-0" onEnded={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  event.mutate({
                    roomId: room?.id,
                    event: 'ENDED'
                  })
                }} onError={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  event.mutate({
                    roomId: room?.id,
                    event: 'ERROR'
                  })
                  }}>

                </HLSPlayer>
              </div>
            }
          </div>
        </main>}
      </Layout>
      </>
  )
}

export default Monitor