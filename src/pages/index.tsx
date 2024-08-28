import Head from "next/head";
import Link from "next/link";

import { api } from "@uta/utils/api";
import { useState } from "react";
import { Item } from "@uta/types/yt.types";
import type { AppRouter } from "@uta/server/api/root";
import { inferRouterOutputs } from "@trpc/server";
import NavBar from "@uta/comps/nav";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default function Home() {
  const [temp, setTemp] = useState({} as RouterOutput["songs"]["search"]);
  const search = api.songs.search.useMutation({
    onSuccess: (data) => {
      setTemp(data);
      setAddedList([]);
    }
  });
  const addQueue = api.songs.addQueue.useMutation();
  const addToTop = api.songs.addToFirstQueue.useMutation();
  const command = api.songs.broadcastPlayerCommand.useMutation();
  const [karaokeToggle, setKaraokeToggle] = useState(true);
  const [input, setInput] = useState('');
  const [addedList, setAddedList] = useState<string[]>([]);
  const handlePlay = (id: string) => {
    //Open new tab with video
    if (id.includes('sm')) { 
      window.open(`https://www.nicovideo.jp/${id}`, '_blank');
      return;
    }
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
  };

  const handleQueue = (data: any) => {
    if (addedList.includes(data.href || data.id)) return;
    addQueue.mutate({data});
    setAddedList([...addedList, (data.href || data.id)])
    console.log('List:', addedList);
  };
  return (
    <>
      <Head>
        <title>歌の色</title>
        <meta name="description" content="歌の色 カラオケ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <NavBar />
        <div className="max-w-xl mx-auto p-4">
          <form action="post" onSubmit={(e) => {
            e.preventDefault();
            search.mutate({ text: input, karaoke: karaokeToggle });
          }}>
          <div className="flex mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search videos..."
              className="flex-grow p-2 border border-gray-300 rounded-l-md"
            />
              <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              Search
            </button>
            
          </div>
          <div className="flex items-end w-full justify-end">
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={() => setKaraokeToggle(!karaokeToggle)} checked={karaokeToggle} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Karaoke</label>
              </div>
          </div>
            </form>
          <div className="space-y-4 text-white">
            {temp?.youtube?.items?.map((video: Item) => (
              <div key={video.id} className="flex items-center space-x-4 p-2 border rounded-md">
                <img
                  src={video.thumbnail.thumbnails[0]?.url}
                  alt={video.title}
                  className="w-auto h-24 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <div className="text-lg font-medium">{video.title}</div>
                  <div className="mt-2 space-x-2">
                    <button
                      disabled={addedList.includes(video.id)}
                      onClick={() => handleQueue(video)}
                      className={`px-3 py-1 ${addedList.includes(video.id) ? 'bg-gray-500 hover:bg-gray-500' : 'bg-green-500'} text-white rounded-md hover:bg-green-600`}
                    >
                      {addedList.includes(video.id) ? 'Added' : 'Queue'}
                    </button>
                    <button
                      onClick={() => {
                        addQueue.mutateAsync({ data: video }).then((e) => {
                          const id = e?.id;
                          if (!id) return;
                          addToTop.mutateAsync({ id }).then(() => {
                            command.mutate('NEXT');
                          })
                        })
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => handlePlay(video.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <hr />
            {temp?.nico?.map((video) => (
              <div key={video.href} className="flex items-center space-x-4 p-2 border rounded-md">
                <img
                  src={video.thumb}
                  alt={video.title}
                  className="w-auto h-24 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <div className="text-lg font-medium">{video.title}</div>
                  <div className="mt-2 space-x-2">
                    <button
                      disabled={addedList.includes(video.href)}
                      onClick={() => handleQueue(video)}
                      className={`px-3 py-1 ${addedList.includes(video.href) ? 'bg-gray-500 hover:bg-gray-500' : 'bg-green-500'} text-white rounded-md hover:bg-green-600`}
                    >
                      {addedList.includes(video.href) ? 'Added' : 'Queue'}
                    </button>
                    <button
                      onClick={() => {
                        addQueue.mutateAsync({ data: video }).then((e) => {
                          const id = e?.id;
                          if (!id) return;
                          addToTop.mutateAsync({ id }).then(() => {
                            command.mutate('NEXT');
                          })
                        })
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => handlePlay(video.href)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </main>
    </>
  );
}
