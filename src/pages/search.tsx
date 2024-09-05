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
import Image from "next/image"
import { RxCaretSort, RxCircle, RxClipboard, RxDoubleArrowDown, RxDoubleArrowLeft, RxDoubleArrowRight, RxDoubleArrowUp, RxMagnifyingGlass, RxPlay, RxPlusCircled, RxReload, RxShare1, RxShare2 } from "react-icons/rx"

export function Monitor() {
  const room = useRoom()
  const search = api.songs.search.useMutation()
  const handleSearch = async (keyword: string) => {
    search.mutate({ roomId: room?.id ?? '', text: keyword })
  }

  const getLink = (type: string, id: string) => { 
    switch (type) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${id}`
      case 'niconico':
        return `https://www.nicovideo.jp${id}`
      default:
        return ''
    }
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
                              <img alt="Image" className="rounded-md object-cover" src={song.thumb} />
                            </AspectRatio>
                         </div>
                          <div className="flex flex-col px-2 w-full">
                            <span className="text-sm md:text-xl text-purple-400 font-semibold pt-1">
                              {song.title}
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
                      <DropdownMenuItem disabled>
                        <RxPlay /> <span className="ml-2">Play now</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><RxPlusCircled /> <span className="ml-2">Add to queue</span></DropdownMenuItem>
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><RxCircle /> <span className="ml-2">Add to custom queue...</span></DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="dark">
                            <DropdownMenuItem><RxDoubleArrowLeft /> <span className="ml-2">Play next</span></DropdownMenuItem>
                            <DropdownMenuItem><RxDoubleArrowRight /> <span className="ml-2">Last in queue</span></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">Before</span></DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="dark">
                                  <DropdownMenuItem><RxDoubleArrowDown /> <span className="ml-2">Last</span></DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">After</span></DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="dark">
                                  <DropdownMenuItem><RxDoubleArrowDown /> <span className="ml-2">Last</span></DropdownMenuItem>
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
                    <DropdownMenuItem><RxShare1 /> <span className="ml-2">Share</span></DropdownMenuItem>
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