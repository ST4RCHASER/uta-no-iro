import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import Layout from "@uta/components/layout"
import { useRoom } from "@uta/hooks/useRoom"
import {
  Card,
} from "@uta/shadcn/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@uta/shadcn/components/ui/dropdown-menu"
import { Slider } from "@uta/shadcn/components/ui/slider"
import { api } from "@uta/utils/api"
import { getLink, secToMinuteFormat } from "@uta/utils/convert"
import Image from "next/image"
import { useEffect, useState } from "react"
import { RxCaretDown, RxCaretSort, RxCaretUp, RxClipboard, RxDoubleArrowDown, RxDoubleArrowUp, RxMinusCircled, RxPause, RxPlay, RxShare1, RxShare2 } from "react-icons/rx"
export function Monitor() {
  const room = useRoom()
  const play = api.songs.play.useMutation()
  const changeOrder = api.songs.changeQueueOrder.useMutation()
  const deleteQueue = api.songs.deleteQueue.useMutation()
  const broadcastPlayerCommand = api.songs.broadcastPlayerCommand.useMutation()
  const [fakeSeeker, setFakeSeeker] = useState(0);

  useEffect(() => {
    if (room?.states) {
      setFakeSeeker(0)
    }
  }, [JSON.stringify(room?.states)])

  return (
    <>
      <Layout title="Remote" description="Controll player and queues">
        <div className="flex items-center justify-center">
          <div className="w-full">
            <div className="bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-500 border-b rounded-t-xl p-4 pb-6 sm:p-10 sm:pb-8 lg:p-6 xl:p-10 xl:pb-8 space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-8  items-center">
              <div className="flex items-center space-x-4">
                <Image src={
                  room?.states?.track?.thumb ?? 'https://via.placeholder.com/88'
                } alt={
                   room?.states?.track?.title ?? 'No track'
                } width="88" height="88" className="flex-none rounded-lg bg-slate-100" loading="lazy" />
                <div className="min-w-0 flex-auto space-y-1 font-semibold">
                  <p className="text-purple-500 dark:text-purple-400 text-sm leading-6">
                    <abbr title="Track">Soruce:</abbr> <span className="capitalize">
                      {
                        room?.states?.track?.type ?? 'No track playing'
                      }
                    </span>
                  </p>
                  <h2 className="text-slate-500 dark:text-slate-400 text-sm leading-6 truncate">
                    {room?.states?.track?.description ?? '-'}
                  </h2>
                  <p className="text-slate-900 dark:text-slate-50 text-lg">
                    {room?.states?.track?.title ?? '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-full">
                    <Slider
                      onValueChange={(value) => {
                        setFakeSeeker(value[0] ?? 0)
                        broadcastPlayerCommand.mutate({
                          roomId: room?.id ?? '',
                          cmd: JSON.stringify({
                            type: 'SEEK',
                            payload: {
                              sec: value[0]
                            }
                          })
                        })
                      }}
                      value={
                        fakeSeeker > 0 ? [fakeSeeker] : [room?.states?.currentTime ? Math.ceil(room.states.currentTime) : 0]
                      }
                      max={
                        room?.states?.duration ? room?.states?.duration : 0
                      } min={0} step={1} />
                  </div>
                </div>
                <div className="flex justify-between text-sm leading-6 font-medium tabular-nums">
                  <div className="text-purple-500 dark:text-slate-100">{room?.states?.currentTime && secToMinuteFormat(room.states.currentTime) }</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {room?.states?.duration && secToMinuteFormat(room.states.duration)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 text-slate-500 dark:bg-slate-600 dark:text-slate-200 rounded-b-xl flex items-center">
              <div className="flex-auto flex items-center justify-evenly">
                <button type="button" aria-label="Previous"
                  onClick={() => {
                    broadcastPlayerCommand.mutate({
                      roomId: room?.id ?? '',
                      cmd: JSON.stringify({
                        type: 'RESTART'
                      })
                    })
                  }}
                >
                  <svg width="24" height="24" fill="none">
                    <path d="m10 12 8-6v12l-8-6Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" aria-label="Rewind 10 seconds"
                  onClick={() => {
                    broadcastPlayerCommand.mutate({
                      roomId: room?.id ?? '',
                      cmd: JSON.stringify({
                        type: 'SEEK',
                        payload: {
                          sec: room?.states?.currentTime ? room.states.currentTime - 10 : 0
                        }
                      })
                    })
                  }}
                >
                  <svg width="24" height="24" fill="none">
                    <path d="M6.492 16.95c2.861 2.733 7.5 2.733 10.362 0 2.861-2.734 2.861-7.166 0-9.9-2.862-2.733-7.501-2.733-10.362 0A7.096 7.096 0 0 0 5.5 8.226" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M5 5v3.111c0 .491.398.889.889.889H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
              <button type="button" className="bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-700 flex-none -my-2 mx-auto w-20 h-20 rounded-full ring-1 ring-slate-900/5 shadow-md flex items-center justify-center" aria-label="Pause/Play"
                onClick={() => {
                  broadcastPlayerCommand.mutate({
                    roomId: room?.id ?? '',
                    cmd: JSON.stringify({
                      type: room?.states?.state === 'playing' ? 'PAUSE' : 'PLAY'
                    })
                  })
                }}
              >
                {
                  room?.states?.state === 'playing'
                    ? <RxPause className="text-4xl" />
                    : <RxPlay className="text-4xl" />
                }
              </button>
              <div className="flex-auto flex items-center justify-evenly">
                <button type="button" aria-label="Skip 10 seconds"
                  onClick={() => {
                    broadcastPlayerCommand.mutate({
                      roomId: room?.id ?? '',
                      cmd: JSON.stringify({
                        type: 'SEEK',
                        payload: {
                          sec: room?.states?.currentTime ? room.states.currentTime + 10 : 0
                        }
                      })
                    })
                  }}
                >
                  <svg width="24" height="24" fill="none">
                    <path d="M17.509 16.95c-2.862 2.733-7.501 2.733-10.363 0-2.861-2.734-2.861-7.166 0-9.9 2.862-2.733 7.501-2.733 10.363 0 .38.365.711.759.991 1.176" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M19 5v3.111c0 .491-.398.889-.889.889H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" aria-label="Next"
                  onClick={() => {
                    play.mutate({ roomId: room?.id ?? '' })
                  }}
                >
                  <svg width="24" height="24" fill="none">
                    <path d="M14 12 6 6v12l8-6Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M18 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl font-bold">
            Queues
          </h1>
          <p className="opacity-70">
            Total queues: {room?.queues.length}
          </p>
          <div>
            {
              room?.queues.map(queueTop => (
                <div className="dark" key={queueTop.id}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="mt-4">
                        <Card>
                          <div className="flex border-b py-3 cursor-pointer hover:shadow-md px-2 ">
                            <div className="w-16">
                              <AspectRatio ratio={16 / 9}>
                                <Image width={1280} height={720} alt="Image" className="rounded-md object-cover" src={queueTop.data.thumb} />
                              </AspectRatio>
                            </div>
                            <div className="flex flex-col px-2 w-full">
                              <span className="text-sm text-purple-400 capitalize font-semibold pt-1">
                                #{queueTop.order} • {queueTop.data.title}
                              </span>
                              <span className="text-xs text-slate-400  uppercase font-medium">
                                {queueTop.data.type} • {queueTop.data.description}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 dark">
                      <DropdownMenuLabel>{
                        queueTop.data.title.length > 24
                          ? `${queueTop.data.title.slice(0, 24)}...`
                          : queueTop.data.title
                      }</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => play.mutate({ roomId: room.id, queueId: queueTop.id })}
                        >
                          <RxPlay /> <span className="ml-2">Play now</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">Move</span></DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="dark">
                              <DropdownMenuItem
                                disabled={queueTop.order < 2}
                                onClick={() => changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: 1 })}
                              ><RxDoubleArrowUp /> <span className="ml-2">Top</span></DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={queueTop.order < 2}
                                onClick={() => changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: queueTop.order - 1 })}
                              ><RxCaretUp /> <span className="ml-2">Up</span></DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={queueTop.order === room.queues.length}
                                onClick={() => changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: queueTop.order + 1 })}
                              ><RxCaretDown /> <span className="ml-2">Down</span></DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={queueTop.order === room.queues.length}
                                onClick={() => changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: room.queues.length})}
                              ><RxDoubleArrowDown /> <span className="ml-2">Last</span></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">Before</span></DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent className="dark">
                                    {
                                      room?.queues.map((queue) => (
                                        <DropdownMenuItem
                                          disabled={queue.order === queueTop.order  || queue.order === queueTop.order + 1}
                                          key={queue.id}
                                          onClick={() => {
                                            changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: (queue.order - 1) < 1 ? 1 : queue.order - 1 })
                                          }}
                                        >
                                          <Image width={1280} height={720} alt="song" src={queue.data.thumb} className="w-5 h-5 object-cover rounded" /> <span className="ml-2">#{queue.order} • {
                                            queue.data.title.length > 32
                                              ? `${queue.data.title.slice(0, 32)}...`
                                              : queue.data.title
                                          }</span>
                                        </DropdownMenuItem>
                                      ))
                                    }
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">After</span></DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent className="dark">
                                    {
                                      room?.queues.map((queue) => (
                                        <DropdownMenuItem
                                          disabled={queue.order === queueTop.order || queue.order === queueTop.order - 1}
                                          key={queue.id}
                                          onClick={() => {
                                            changeOrder.mutate({ roomId: room.id, queueId: queueTop.id, newQueueOrder: queue.order })
                                          }}
                                        >
                                          <Image width={1280} height={720} alt="song" src={queue.data.thumb} className="w-5 h-5 object-cover rounded" /> <span className="ml-2">#{queue.order} • {
                                            queue.data.title.length > 32
                                              ? `${queue.data.title.slice(0, 32)}...`
                                              : queue.data.title
                                          }</span>
                                        </DropdownMenuItem>
                                      ))
                                    }
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <a href={getLink(queueTop.type, queueTop.data.id)} target="_blank" rel="noreferrer" className="cursor-pointer">
                        <DropdownMenuItem>
                          <RxShare2 /> <span className="ml-2">Open on this device</span>
                        </DropdownMenuItem>
                      </a>
                      <DropdownMenuItem
                        onClick={
                          () => {
                            navigator.share({
                              title: queueTop.data.title,
                              text: queueTop.data.description,
                              url: getLink(queueTop.type, queueTop.data.id),
                            }).then(() => console.log('Successful share')).catch((error) => console.log('Error sharing', error));
                          }
                      }
                      >
                        <RxShare1 /> <span className="ml-2">Share</span></DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><RxClipboard /> <span className="ml-2">Copy</span></DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="dark">
                              <DropdownMenuItem
                                onClick={() => {
                                  void navigator.clipboard.writeText(getLink(queueTop.type, queueTop.data.id))
                                }}
                              ><RxClipboard /> <span className="ml-2">Link</span></DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  void navigator.clipboard.writeText(queueTop.data.title)
                                }}
                              ><RxClipboard /> <span className="ml-2">Title</span></DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteQueue.mutate({ roomId: room.id, queueId: queueTop.id })}
                      >
                        <RxMinusCircled /> <span className="ml-2 text-red-500">Remove form queue</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            }
          </div>
        </div>
      </Layout>
      </>
  )
}

export default Monitor