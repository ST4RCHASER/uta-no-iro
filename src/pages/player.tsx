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

  const htmlPlayerRef = useRef<HTMLVideoElement | null>(null);
  const [karaokeSlider, setKaraokeSlider] = useState(100);
  const [masterSlider, setMasterSlider] = useState(50);
  const htmlPlayerAudioContextRef = useRef<AudioContext | null>(null);
  const htmlPlayerSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const htmlPlayerLeftGainRef = useRef<GainNode | null>(null);
  const htmlPlayerRightGainRef = useRef<GainNode | null>(null);
  const htmlPlayerSplitterRef = useRef<ChannelSplitterNode | null>(null);


  let lastSent = Date.now();

  useEffect(() => {
    if (isReady && room) {
      updater.mutate({
        id: room.id,
        data: {
          ...playerState,
          audioChannelVolume: karaokeSlider,
          masterVolume: masterSlider,
          updatedAt: new Date().getTime()
        }
      })
    }
    if(isReady) {
      try  {
        if(htmlPlayerRef.current) {
          htmlPlayerRef.current.volume = masterSlider / 100;
        }
      }catch {}
      try {
        if(hlsPlayerRef.current) {
          hlsPlayerRef.current.volume = masterSlider / 100;
        }
      }catch {}
      try {
        if(playerRef) {
          playerRef.setVolume(masterSlider);
        }
      }catch {}
    }
  }, [JSON.stringify(playerState), isReady])

  useEffect(() => { 
    if (room && room.states !== null && !isReady) { 
      setPlayerState(room.states);
      setMasterSlider(room.states.masterVolume ?? 50);
      setKaraokeSlider(room.states.audioChannelVolume ?? 100);
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

  // html player
  useEffect(() => {
    if(!htmlPlayerRef.current) {
      htmlPlayerAudioContextRef.current = null;
      htmlPlayerSourceNodeRef.current = null;
      htmlPlayerLeftGainRef.current = null;
      htmlPlayerRightGainRef.current = null;
      htmlPlayerSplitterRef.current = null;
      return;
    }
    const setupAudio = () => {
      if(!htmlPlayerRef.current) {
        console.log('Missing audio context or nodes');
        return;
      }
      // Create a new AudioContext
      htmlPlayerAudioContextRef.current = new AudioContext();

      // Create source node from the video element
      htmlPlayerSourceNodeRef.current = htmlPlayerAudioContextRef.current.createMediaElementSource(htmlPlayerRef.current);

      // Create a channel splitter (splits left and right channels)
      htmlPlayerSplitterRef.current = htmlPlayerAudioContextRef.current.createChannelSplitter(2);

      // Create gain nodes to control the volume of left and right channels
      htmlPlayerLeftGainRef.current = htmlPlayerAudioContextRef.current.createGain();
      htmlPlayerRightGainRef.current = htmlPlayerAudioContextRef.current.createGain();

      // Connect the splitter to left and right gain nodes
      htmlPlayerSplitterRef.current.connect(htmlPlayerLeftGainRef.current, 0); // Left channel
      htmlPlayerSplitterRef.current.connect(htmlPlayerRightGainRef.current, 1); // Right channel

      // Connect left and right gains to the destination (speakers)
      htmlPlayerLeftGainRef.current.connect(htmlPlayerAudioContextRef.current.destination);
      htmlPlayerRightGainRef.current.connect(htmlPlayerAudioContextRef.current.destination);

      // Connect the source node to the splitter
      htmlPlayerSourceNodeRef.current.connect(htmlPlayerSplitterRef.current);
    };


    const onPlay = () => {
      if(!htmlPlayerAudioContextRef.current) {
        console.log('Setting up audio context');
        setupAudio(); 
      }
    };
    const onEnded = () => {
      eventSender.mutate({
        roomId: room?.id,
        event: 'ENDED'
      });
    };
  
    if (htmlPlayerRef.current) {
      // Attach event listeners
      htmlPlayerRef.current.addEventListener('play', onPlay);
      htmlPlayerRef.current.addEventListener('ended', onEnded);
    }
  
    return () => {
      // Cleanup event listeners and audio context
      if (htmlPlayerRef.current) {
        htmlPlayerRef.current.removeEventListener('play', onPlay);
        htmlPlayerRef.current.removeEventListener('ended', onEnded);
      }
    };
  }, [htmlPlayerRef.current]);


  // html player track time
  useEffect(() => {
    setPlayerState({
      ...playerState,
      // is playing 
      state: playerState.state !== 'idle' && playerState.state !== 'loading' && htmlPlayerRef?.current?.paused ? 'paused' : 'playing',
      duration: htmlPlayerRef?.current?.duration ?? 0,
      currentTime: htmlPlayerRef?.current?.currentTime ?? 0
    });
     if(playerState?.track?.type === 'remote') {
      if(!htmlPlayerLeftGainRef.current || !htmlPlayerRightGainRef.current) {
        console.log('No gain node found');
        return;
      }
      const karaokeChannel = room?.states?.track?.karaChannel
      // flip if right channel is karaoke
      let value = karaokeSlider
      if (karaokeChannel === 'L') {
        value = 100 - value;
      }
      if (value === 50 || karaokeChannel === 'UNSUPORTED') {
        // Stereo Mode (equal volume on both channels)
        htmlPlayerLeftGainRef.current.gain.value = 0.6;
        htmlPlayerRightGainRef.current.gain.value = 0.6;
      } else if (value < 50) {
        // Karaoke Mode (adjust based on slider position, left channel muted)
        htmlPlayerLeftGainRef.current.gain.value = value / 50;
        htmlPlayerRightGainRef.current.gain.value = 1;
      } else {
        // Vocal Mode (adjust based on slider position, right channel muted)
        htmlPlayerLeftGainRef.current.gain.value = 1;
        htmlPlayerRightGainRef.current.gain.value = (100 - value) / 50;
      }
     }
  }, [Math.round(htmlPlayerRef.current?.currentTime ?? 0),htmlPlayerRef.current?.duration])

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
          if(htmlPlayerRef.current) {
            htmlPlayerRef.current.currentTime = htmlPlayerRef.current.currentTime - 10;
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
          if(htmlPlayerRef.current) {
            htmlPlayerRef.current.currentTime = htmlPlayerRef.current.currentTime + 10;
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
        case 'AUDIO_CHANNEL_VOLUME':
          console.log('Karaoke slider', event.payload?.ch_vol);
          updateKaraokeSlider(event.payload?.ch_vol ?? 50);
          break;
        case 'MASTER_VOLUME':
          console.log('Master slider', event.payload?.mas_vol);
          updateMasterSlider(event.payload?.mas_vol ?? 50);
          break;
        case 'TOGGLE_PLAY':
          try  {
            if (playerRef) {
              if (playerState.state !== 'playing') {
                playerRef?.playVideo();
              } else {
                playerRef?.pauseVideo();
              }
            }
          } catch {}
          try  {
            if (hlsPlayerRef.current) {
              if (hlsPlayerRef.current.paused) {
                void hlsPlayerRef.current.play();
              } else {
                hlsPlayerRef.current.pause();
              }
            }
          }catch {}
          try {
            if (htmlPlayerRef.current) {
              if (htmlPlayerRef.current.paused) {
                void htmlPlayerRef.current.play();
              } else {
                htmlPlayerRef.current.pause();
                setPlayerState({
                  ...playerState,
                  state: 'paused'
                });
              }
            }
          } catch {}
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
          try  {
            if (playerRef) {
              playerRef?.seekTo(event?.payload?.sec ?? 0);
            }
          }catch {}
          try  {
            if (hlsPlayerRef.current) {
              hlsPlayerRef.current.currentTime = event?.payload?.sec ?? 0;
            }
          }catch {}
          try  {
            if (htmlPlayerRef.current) {
              htmlPlayerRef.current.currentTime = event?.payload?.sec ?? 0;
            }
          } catch {}
          break;
        case 'RESTART':
          try  {
            if (playerRef) {
              playerRef?.seekTo(0);
            }
          } catch {}
         try  {
          if (hlsPlayerRef.current?.currentTime) {
            hlsPlayerRef.current.currentTime = 0;
          }
         } catch {}
          try {
            if (htmlPlayerRef.current?.currentTime) {
              htmlPlayerRef.current.currentTime = 0;
            }
          } catch {}
          break;
        case 'PLAY':
          try {
            if (playerRef) {
              playerRef?.playVideo();
            }
          } catch {}
          try {
            if (hlsPlayerRef.current?.paused) {
              void hlsPlayerRef.current.play();
            }
          } catch {}
          try  {
            if (htmlPlayerRef.current?.paused) {
              void htmlPlayerRef.current.play();
            }
          } catch {}
          break;
        case 'PAUSE':
          try {
            if (playerRef) {
              playerRef?.pauseVideo();
            }
          } catch {}
          try  {
            if (hlsPlayerRef?.current && !hlsPlayerRef?.current?.paused) {
              hlsPlayerRef.current.pause();
            }
          } catch {}
          try {
            if (htmlPlayerRef?.current && !htmlPlayerRef?.current?.paused) {
              htmlPlayerRef.current.pause();
              setPlayerState({
                ...playerState,
                state: 'paused'
              });
            }
          } catch {}
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

    const updateKaraokeSlider = (value: number) => {
      setKaraokeSlider(value);
      setPlayerState({
        ...playerState,
        audioChannelVolume: value
      });
    };

    const updateMasterSlider = (value: number) => {
      setMasterSlider(value);
      setPlayerState({
        ...playerState,
        masterVolume: value
      });
    };

  return (
    <div>
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
                            <Image alt={track.id} width={1280} height={720} src={track?.thumb || 'https://m1r.ai/Y45Fp.png'} className="h-auto w-24 rounded-lg" />
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
                <HLSPlayer manifest={`https://nicovrc.net/proxy?https://www.nicovideo.jp${playerState.track.id}`} controls={true} ref={hlsPlayerRef} autoPlay className="w-screen h-screen fixed left-0 top-0 bg-black" onEnded={() => {
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
            {
              playerState.track && playerState.track.type === 'remote' && <div>
                <video src={playerState.track.id} crossOrigin="anonymous" controls={true} ref={htmlPlayerRef} autoPlay className="w-screen h-screen fixed left-0 top-0 bg-black" 
                onEnded={() => {
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
                </video>
              </div>
            }
          </div>
        </main>}
      </Layout>
      </div>
  )
}

export default Monitor