import HLSPlayer from "@uta/components/hlsPlayer";
import Layout from "@uta/components/layout"
import { useRoom } from "@uta/hooks/useRoom";
import { api } from "@uta/utils/api";
import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import type { FakeYoutubeVideoPlayer, RoomState, Track } from "@uta/types/room.types";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@uta/shadcn/components/ui/command";
import Image from "next/image";

export function Monitor() {
  const room = useRoom()
  const updater = api.rooms.updateRoomState.useMutation();
  const eventSender = api.songs.playerEvent.useMutation();
  const search = api.songs.search.useMutation()
  const [playerState, setPlayerState] = useState({
    state: 'idle',
    track: null
  } as RoomState);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [playerRef, setPlayerRef] = useState<FakeYoutubeVideoPlayer>()
  const hlsPlayerRef = useRef<HTMLVideoElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [searchBounce, setSearchBounce] = useState<NodeJS.Timeout>();
  const addQueue = api.songs.addToQueue.useMutation()
  const [pickSong, setPickSong] = useState<string>();
  let lastSent = Date.now();

  useEffect(() => {
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
    if (playerRef?.playerInfo) { 
      setPlayerState({
        ...playerState,
        currentTime: playerRef?.playerInfo.currentTime,
        duration: playerRef?.playerInfo.duration,
      })
    }
    const createdEvent = ((e: KeyboardEvent) => {
      if (lastSent + 50 > Date.now()) return;
      lastSent = Date.now();
      if (e.key == ' ' && searchKeyword.length === 0) {
        onData(JSON.stringify({ type: 'TOGGLE_PLAY', payload: null }))
        return
      }
      if (e.key == 'Insert') {
        console.log('Insert', pickSong);
        if (pickSong) {
          const song = search.data?.find((track) => track.id === pickSong);
          if (song) {
            addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: (room?.queues.length ?? 0) + 1 })
            setSearchKeyword('');
          }
        }
      }
      if (e.key == 'End') {
        lastSent = Date.now();
        onData(JSON.stringify({ type: 'NEXT', payload: null }))
        return
      }
      if (e.key == 'Home') {
        onData(JSON.stringify({ type: 'RESTART', payload: null }))
        return
      }
      if (e.key == 'ArrowLeft') {
        try {
          if (playerRef) {
            playerRef?.seekTo(playerRef?.playerInfo.currentTime - 10);
          }
          if (hlsPlayerRef.current) {
            hlsPlayerRef.current.currentTime = hlsPlayerRef.current.currentTime - 10;
          }
        } finally {
          return
        }
      }
      if (e.key == 'ArrowRight') {
        try {
          if (playerRef) {
            playerRef?.seekTo(playerRef?.playerInfo.currentTime + 10);
          }
          if (hlsPlayerRef?.current) {
            hlsPlayerRef.current.currentTime = hlsPlayerRef.current.currentTime + 10;
          }
        } finally {
          return
        }
      }
      if (e.key.length !== 1) return;
      if (searchBoxRef?.current) {
        searchBoxRef.current.focus();
      }
      if (!searchKeyword) {
        setSearchKeyword(e.key.slice(0, 1));
      }
    })
    window.addEventListener('keydown', createdEvent)
    return () => {
      if (createdEvent) {
        window.removeEventListener('keydown', createdEvent)
      }
    }
  }, [JSON.stringify(playerRef?.playerInfo)])

  const onData = (data: string) => { 
    const event = (typeof data === 'string' ? JSON.parse(data) : data) as { type: string, payload: Track };
    console.log('Player event', event,playerRef, hlsPlayerRef.current);
    try {
      switch (event.type) {
        case 'TOGGLE_PLAY':
          if (playerRef) {
            if (playerState.state !== 'playing') {
              playerRef?.playVideo();
            } else {
              playerRef?.pauseVideo();
            }
          }
          if (hlsPlayerRef.current) {
            if (hlsPlayerRef.current.paused) {
              void hlsPlayerRef.current.play();
            } else {
              hlsPlayerRef.current.pause();
            }
          }
          break
        case 'PLAY_TRACK':
          setPlayerState({
            ...playerState,
            state: 'loading',
            track: event.payload
          });
          break;
        case 'NEXT':
          setPlayerState({
            ...playerState,
            state: 'idle',
            track: null
          });
          eventSender.mutate({
            roomId: room?.id,
            event: 'ENDED'
          })
          break;
        case 'SEEK':
          if (playerRef) {
            playerRef?.seekTo(event?.payload?.sec ?? 0);
          }
          if (hlsPlayerRef.current) {
            hlsPlayerRef.current.currentTime = event?.payload?.sec ?? 0;
          }
          break;
        case 'RESTART':
          if (playerRef) {
            playerRef?.seekTo(0);
          }
          if (hlsPlayerRef.current?.currentTime) {
            hlsPlayerRef.current.currentTime = 0;
          }
          break;
        case 'PLAY':
          if (playerRef) {
            playerRef?.playVideo();
          }
          if (hlsPlayerRef.current?.paused) {
            void hlsPlayerRef.current.play();
          }
          break;
        case 'PAUSE':
          if (playerRef) {
            playerRef?.pauseVideo();
          }
          if (hlsPlayerRef?.current && !hlsPlayerRef?.current?.paused) {
            hlsPlayerRef.current.pause();
          }
          break;
      }
    } catch (e) {
      console.error('Event failed', e);
    }
  }

  api.songs.onBroadcast.useSubscription({
    roomId: room?.id ?? ''
  }, {
    onData
  });

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.length < 3) return;
    if (searchBounce) {
      clearTimeout(searchBounce);
    }
    setSearchBounce(setTimeout(() => {
      search.mutate({ roomId: room?.id ?? '', text: keyword })
    },1500))
  }

  return (
    <>
      <Layout title="Player" description="No queue right now, please add some song!">
        <div className="z-40 fixed h-screen w-screen overflow-hidden"></div>
        <div className="dark overflow-hidden">
          <CommandDialog open={!!searchKeyword} onOpenChange={
            (open) => {
              if (!open) {
                setSearchKeyword('');
                if (searchBounce) {
                  clearTimeout(searchBounce);
                }
              }
            }
          }>
            <Command loop value={pickSong} shouldFilter={false}
              onValueChange={setPickSong}
            >
              <CommandInput placeholder="Type search keyword..." ref={searchBoxRef} onValueChange={
                (value) => {
                  void handleSearch(value);
                }
              }
              />
              <CommandList>
                {
                  search?.data?.length && <div className="w-full px-8 py-4 flex justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 justify-start">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          ENTER
                        </kbd>
                        <p className="text-muted-foreground text-xs">
                          Add
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-start">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        INSERT
                      </kbd>
                      <p className="text-muted-foreground text-xs">
                        Add next
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        END
                      </kbd>
                      <p className="text-muted-foreground text-xs">
                        Skip current
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        HOME
                      </kbd>
                      <p className="text-muted-foreground text-xs">
                        Restart
                      </p>
                    </div>
                  </div>
                }
                <CommandEmpty>{
                  searchKeyword?.length < 3 ? 'Type at least 3 characters to search' : (search.data?.length === 0 && !search.isPending) ? 'No result found' : (search.isPending || (!search.isPending && searchKeyword?.length > 2)) ? 'Searching...' : 'No result found'
                }</CommandEmpty>
                <CommandGroup >
                  {
                    search.data?.map((track) => {
                      return <CommandItem key={track.id} value={track.id}
                        onSelect={
                        () => {
                          addQueue.mutate({ roomId: room?.id ?? '', type: track.type, data: track, order: (room?.queues.length ?? 0) + 1 })
                          setSearchKeyword('');
                        }}>
                       
                          <div>
                            <Image alt={track.id} width={1280} height={720} src={track?.thumb || ''} className="h-auto w-24 rounded-lg" />
                          </div>
                          <div className="ml-2">
                            <p>{track.title}</p>
                            <p className="capitalize opacity-50 text-xs">
                              {track.type}
                            </p>
                          </div>
                      </CommandItem>
                    })
                  }
                </CommandGroup>
            </CommandList>
            </Command>
          </CommandDialog>
        </div>
        {/* {JSON.stringify(playerState)} */}
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
                  eventSender.mutate({
                    roomId: room?.id,
                    event: 'READY'
                  })
                }}
                onEnd={() => {
                  onData(JSON.stringify({ type: 'NEXT', payload: null }))
                }}
                onError={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  eventSender.mutate({
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
                  onData(JSON.stringify({ type: 'NEXT', payload: null }))
                }} onError={() => {
                  setPlayerState({
                    ...playerState,
                    state: 'idle',
                    track: null
                  });
                  eventSender.mutate({
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