import Head from "next/head";
import { api } from "@uta/utils/api";
import { useEffect, useRef, useState } from "react";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@uta/server/api/root";
import YouTube from "react-youtube";
import HLSPlayer from "@uta/comps/hls";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default function Home() {
  const broadcast = api.songs.broadcastPlayerCommand.useMutation();
  const [playerRef, setPlayerRef] = useState<any>()
  const hlsPlayerRef = useRef<HTMLVideoElement>(null);
  const [toPlaySong, setToPlaySong] = useState<RouterOutput["songs"]["getNextSong"] | null>(null);
  const nextSong = api.songs.getNextSong.useMutation({
    onSuccess(data) {
      setToPlaySong(data);
    }
  });
  const sub = api.songs.onBroadcast.useSubscription(undefined,{
    onData(data: string) { 
      try {
        switch (data) {
          case 'NEXT':
            nextSong.mutate();
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
              hlsPlayerRef.current.play();
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
        console.error('Event failed',e);
      }
    }
  });
  useEffect(() => { }, [toPlaySong]);
  return (
    <>
      <Head>
        <title>歌の色 - Player</title>
        <meta name="description" content="歌の色 カラオケ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="max-w-xl mx-auto p-4">
          {!!toPlaySong && (JSON.parse(toPlaySong.data))?.id && <div className="w-screen h-screen fixed left-0 top-0">
            <YouTube videoId={
              (JSON.parse(toPlaySong.data))?.id
            }
              allow="autoplay"
              title={(JSON.parse(toPlaySong.data))?.title}
              iframeClassName="w-screen h-screen fixed left-0 top-0"
              onStateChange={(e: any) => {
                setPlayerRef(e.target);
              }}
              onReady={(e: any) => {
                e.target.playVideo();
              }}
              onEnd={() => {
                nextSong.mutate();
              }}
              onError={() => {
                nextSong.mutate();
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
            !!toPlaySong && (JSON.parse(toPlaySong.data))?.href && <div >
              <HLSPlayer manifest={`https://nicovrc.net/proxy?https://www.nicovideo.jp${JSON.parse(toPlaySong.data)?.href}`} controls={true} ref={hlsPlayerRef} className="w-screen h-screen fixed left-0 top-0" onEnded={() => {
                nextSong.mutate();
              }} onError={() => {
                nextSong.mutate();
              }}>

              </HLSPlayer>
            </div>
          }
        </div>
      </main>
    </>
  );
}
