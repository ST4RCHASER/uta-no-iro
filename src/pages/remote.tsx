import Head from "next/head";
import Link from "next/link";

import { api } from "@uta/utils/api";
import type { AppRouter } from "@uta/server/api/root";
import { inferRouterOutputs } from "@trpc/server";
import NavBar from "@uta/comps/nav";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default function Home() {
  const addToFirst = api.songs.addToFirstQueue.useMutation();
  const { data, refetch } = api.songs.getCurrentQueue.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const remove = api.songs.removeSongFromQueue.useMutation();
  const currentSong = api.songs.getCurrentSong.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const broadcast = api.songs.broadcastPlayerCommand.useMutation();
  const moveDown = api.songs.orderDown.useMutation({
    onSuccess: () => {
      refetch();
    }
  });
  const moveUp = api.songs.orderUp.useMutation({
    onSuccess: () => {
      refetch();
    }
  });
  const command = api.songs.broadcastPlayerCommand.useMutation({
    onSuccess: () => {
      refetch();
    }
  });
  return (
    <>
      <Head>
        <title>歌の色 - Remote</title>
        <meta name="description" content="歌の色 カラオケ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <NavBar />
        <div className="w-1/2 mx-auto p-4">
          <h1 className="text-3xl text-white font-bold mb-4">Playing</h1>
          <div  className="items-center justify-between bg-gray-800 p-2 rounded-md mb-2 p-4">
            <div className="flex items-center">
              <img src={JSON.parse(currentSong?.data?.value || '{}')?.thumbnail?.thumbnails[0]?.url || JSON.parse(currentSong?.data?.value || '{}')?.thumb} className="w-auto h-16 object-cover rounded-md" />
              <div className="ml-2">
                <p className="text-2xl text-white"></p>
                <p className="text-white font-bold">{(JSON.parse(currentSong?.data?.value || '{}')).title}</p>
                <p className="text-gray-400"></p>
              </div>
            </div>
            <div className="flex between">
              <button onClick={() => {
                broadcast.mutate('NEXT');
              }} className="bg-blue-500 text-white p-2 rounded-md mt-4 w-full">
                Next
              </button>
              <button onClick={() => {
                broadcast.mutate('PLAY');
              }} className="bg-green-500 text-white p-2 rounded-md mt-4 ml-2 w-full">
                Play
              </button>
              <button onClick={() => {
                broadcast.mutate('PAUSE');
              }} className="bg-red-500 text-white p-2 rounded-md mt-4 ml-2 w-full">
                Pause
              </button>
              <button onClick={() => {
                broadcast.mutate('RESTART');
              }} className="bg-yellow-500 text-white p-2 rounded-md mt-4 ml-2 w-full">
                Restart
              </button>
            </div>
          </div>
          
          <div className="flex flex-col mt-4">
            <hr />
            <h2 className="text-white font-bold text-xl mt-4">Current Queue</h2>
            <ul className="mt-2">
              {data?.map((item, index) => (
                <li key={item.id} className="items-center justify-between bg-gray-800 p-2 rounded-md mb-2 p-4">
                  <div className="flex items-center">
                    <img src={(JSON.parse(item.data))?.thumbnail?.thumbnails[0]?.url || JSON.parse(item.data)?.thumb} className="w-auto h-16 object-cover rounded-md" />
                    <div className="ml-2">
                      <p className="text-2xl text-white">{index < 1 ? 'NEXT SONG' : `#${index}`}</p>
                      <p className="text-white font-bold">{(JSON.parse(item.data)).title}</p>
                      <p className="text-gray-400"></p>
                    </div>
                  </div>
                  {
                    <div className="flex items-center mt-4 gap-2">
                      {
                        <button onClick={() => {
                          //Add this data to first
                          addToFirst.mutateAsync(item).then(() => {
                              // Go to this song
                              command.mutateAsync('NEXT').then(() => {
                                refetch();
                              });
                          })
                        }} className="bg-yellow-500 w-full text-white p-2 rounded-md">JUMP</button>
                      }
                      {
                      }
                        {
                          //Is first 
                        JSON.stringify(data[0]) !== JSON.stringify(item)
                        && (
                            <button onClick={() => {
                              moveUp.mutate({ id: item.id });
                          }} className="bg-purple-500 w-full text-white p-2 rounded-md">UP</button>
                          )
                        }
                        {
                        JSON.stringify(data[data.length - 1]) !== JSON.stringify(item) && (
                            <button onClick={() => {
                              moveDown.mutate({ id: item.id });
                            }} className="bg-purple-500 w-full text-white p-2 rounded-md">DOWN</button>
                          )
                      }
                      {
                        <button onClick={() => {
                          remove.mutate({ id: item.id });
                        }} className="bg-red-500 w-full text-white p-2 rounded-md">REMOVE</button>
                      }
                      </div>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
