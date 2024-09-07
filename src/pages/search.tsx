/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Layout from "@uta/components/layout"
import { useRoom } from "@uta/hooks/useRoom"
import { Button } from "@uta/shadcn/components/ui/button"
import {
  Card,
} from "@uta/shadcn/components/ui/card"
import { AspectRatio } from "@uta/shadcn/components/ui/aspect-ratio"
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
import { Input } from "@uta/shadcn/components/ui/input"
import { api } from "@uta/utils/api"
import { RxCaretSort, RxCircle, RxClipboard, RxDoubleArrowLeft, RxDoubleArrowRight, RxMagnifyingGlass, RxPlay, RxPlusCircled, RxReload, RxShare1, RxShare2 } from "react-icons/rx"
import { toast } from "sonner"
import { getLink } from "@uta/utils/convert"
import Image from "next/image"

export function Monitor() {
  const room = useRoom()
  const playerBroadcast = api.songs.broadcastPlayerCommand.useMutation()
  const search = api.songs.search.useMutation()
  const addQueue = api.songs.addToQueue.useMutation({
    onMutate: () => { 
      toast.info('Adding song to queue...')
    },
    onSuccess: () => {
      toast.success('Song added to queue')
    },
    onError: () => {
      toast.error('Failed to add song to queue')
    }
  })
  const handleSearch = async (keyword: string) => {
    search.mutate({ roomId: room?.id ?? '', text: keyword })
  }


  return (
    <>
      <Layout title='Search' description='Search and add queue here'>
        <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={
          (e) => {
            e.preventDefault()
            void handleSearch((e.target as unknown as {value: string}[])[0]?.value ?? '')
          }
        }>
          <Input type="text" placeholder="Type keyword here" disabled={search.isPending} />
          <Button type="submit" disabled={search.isPending}>
            {
              search.isPending
                ? <RxReload className="animate-spin" />
                : <RxMagnifyingGlass />
            }
            <span className="ml-2">Search</span>  
          </Button>
        </form>
        <div className="mt-8">
          {
            search.data?.map((song) => (
              <div className="dark" key={song.id}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="mt-4">
                      <Card>
                        <div className="flex border-b py-3 cursor-pointer hover:shadow-md px-2 ">
                          <div className="w-64">
                            <AspectRatio ratio={16 / 9}>
                              <Image alt="Image" className="rounded-md object-cover" src={song.thumb} />
                            </AspectRatio>
                         </div>
                          <div className="flex flex-col px-2 w-full">
                            <span className="text-sm md:text-xl text-purple-400 font-semibold pt-1">
                              {song.title}
                            </span>
                            <span className="text-sm text-slate-400  uppercase font-medium mt-2">
                              {song.description}
                            </span>
                            <span className="text-xs text-slate-400  uppercase font-medium mt-2">
                              {song.type}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 dark">
                    <DropdownMenuLabel>{
                      song.title.length > 24
                        ? `${song.title.slice(0, 24)}...`
                        : song.title
                    }</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          playerBroadcast.mutate({ 
                            roomId: room?.id ?? '', 
                            cmd: JSON.stringify({
                              roomId: room?.id ?? '',
                              type: 'PLAY_TRACK',
                              payload: song
                            })
                           })
                        }}
                      >
                        <RxPlay /> <span className="ml-2">Play now</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: (room?.queues.length ?? 0) + 1 })
                      }}
                    ><RxPlusCircled /> <span className="ml-2">Add to queue</span></DropdownMenuItem>
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><RxCircle /> <span className="ml-2">Add to custom queue...</span></DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="dark">
                            <DropdownMenuItem
                              onClick={() => {
                                addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: 1 })
                              }}
                            ><RxDoubleArrowLeft /> <span className="ml-2">Play next</span></DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: (room?.queues.length ?? 0) + 1 })
                              }}
                            ><RxDoubleArrowRight /> <span className="ml-2">Last in queue</span></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">Before</span></DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="dark">
                                  {
                                    room?.queues.map((queue) => (
                                      <DropdownMenuItem
                                        key={queue.id}
                                        onClick={() => {
                                          addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: queue.order })
                                        }}
                                      >
                                        <Image alt="song" src={queue.data.thumb} className="w-5 h-5 object-cover rounded" /> <span className="ml-2">#{queue.order} • {
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
                                        key={queue.id}
                                        onClick={() => {
                                          addQueue.mutate({ roomId: room?.id ?? '', type: song.type, data: song, order: queue.order + 1 })
                                        }}
                                      >
                                        <Image alt="song" src={queue.data.thumb} className="w-5 h-5 object-cover rounded" /> <span className="ml-2">#{queue.order} • {
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
                    <a href={getLink(song.type,song.id)} target="_blank" rel="noreferrer" className="cursor-pointer">
                      <DropdownMenuItem>
                        <RxShare2 /> <span className="ml-2">Open on this device</span>
                      </DropdownMenuItem>
                    </a>
                    <DropdownMenuItem
                      onClick={
                        () => {
                          navigator.share({
                            title: song.title,
                            text: song.description,
                            url: getLink(song.type, song.id)
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
                              void navigator.clipboard.writeText(getLink(song.type, song.id))
                            }}
                          ><RxClipboard /> <span className="ml-2">Link</span></DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              void navigator.clipboard.writeText(song.title)
                            }}
                          ><RxClipboard /> <span className="ml-2">Title</span></DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
         }
        </div>
      </Layout>
      </>
  )
}

export default Monitor