import Layout from "@uta/components/layout"
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
import { RxCaretDown, RxCaretSort, RxCaretUp, RxDoubleArrowDown, RxDoubleArrowUp, RxMinus, RxMinusCircled, RxPlay, RxShare1, RxShare2 } from "react-icons/rx"
export function Monitor() {
 

  return (
    <>
      <Layout title="Remote" description="Controll player and queues">
        <div className="flex items-center justify-center">
          <div className="w-full">
            <div className="bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-500 border-b rounded-t-xl p-4 pb-6 sm:p-10 sm:pb-8 lg:p-6 xl:p-10 xl:pb-8 space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-8  items-center">
              <div className="flex items-center space-x-4">
                <img src="https://img.freepik.com/free-psd/square-flyer-template-maximalist-business_23-2148524497.jpg?w=1800&t=st=1699458420~exp=1699459020~hmac=5b00d72d6983d04966cc08ccd0fc1f80ad0d7ba75ec20316660e11efd18133cd" alt="" width="88" height="88" className="flex-none rounded-lg bg-slate-100" loading="lazy" />
                <div className="min-w-0 flex-auto space-y-1 font-semibold">
                  <p className="text-purple-500 dark:text-purple-400 text-sm leading-6">
                    <abbr title="Track">Track:</abbr> 05
                  </p>
                  <h2 className="text-slate-500 dark:text-slate-400 text-sm leading-6 truncate">
                    Music: New Album The Lorem
                  </h2>
                  <p className="text-slate-900 dark:text-slate-50 text-lg">
                    Spotisimo
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="bg-purple-500 dark:bg-purple-400 w-1/2 h-2" role="progressbar" aria-label="music progress" aria-valuenow="1456" aria-valuemin="0" aria-valuemax="4550"></div>
                  </div>
                  <div className="ring-purple-500 dark:ring-purple-400 ring-2 absolute left-1/2 top-1/2 w-4 h-4 -mt-2 -ml-2 flex items-center justify-center bg-white rounded-full shadow">
                    <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full ring-1 ring-inset ring-slate-900/5"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm leading-6 font-medium tabular-nums">
                  <div className="text-purple-500 dark:text-slate-100">1:75</div>
                  <div className="text-slate-500 dark:text-slate-400">3:20</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 text-slate-500 dark:bg-slate-600 dark:text-slate-200 rounded-b-xl flex items-center">
              <div className="flex-auto flex items-center justify-evenly">
                <button type="button" aria-label="Add to favorites">
                  <svg width="24" height="24">
                    <path d="M7 6.931C7 5.865 7.853 5 8.905 5h6.19C16.147 5 17 5.865 17 6.931V19l-5-4-5 4V6.931Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" className="hidden sm:block lg:hidden xl:block" aria-label="Previous">
                  <svg width="24" height="24" fill="none">
                    <path d="m10 12 8-6v12l-8-6Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" aria-label="Rewind 10 seconds">
                  <svg width="24" height="24" fill="none">
                    <path d="M6.492 16.95c2.861 2.733 7.5 2.733 10.362 0 2.861-2.734 2.861-7.166 0-9.9-2.862-2.733-7.501-2.733-10.362 0A7.096 7.096 0 0 0 5.5 8.226" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M5 5v3.111c0 .491.398.889.889.889H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
              <button type="button" className="bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-700 flex-none -my-2 mx-auto w-20 h-20 rounded-full ring-1 ring-slate-900/5 shadow-md flex items-center justify-center" aria-label="Pause">
                <svg width="30" height="32" fill="currentColor">
                  <rect x="6" y="4" width="4" height="24" rx="2" />
                  <rect x="20" y="4" width="4" height="24" rx="2" />
                </svg>
              </button>
              <div className="flex-auto flex items-center justify-evenly">
                <button type="button" aria-label="Skip 10 seconds">
                  <svg width="24" height="24" fill="none">
                    <path d="M17.509 16.95c-2.862 2.733-7.501 2.733-10.363 0-2.861-2.734-2.861-7.166 0-9.9 2.862-2.733 7.501-2.733 10.363 0 .38.365.711.759.991 1.176" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M19 5v3.111c0 .491-.398.889-.889.889H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" className="hidden sm:block lg:hidden xl:block" aria-label="Next">
                  <svg width="24" height="24" fill="none">
                    <path d="M14 12 6 6v12l8-6Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M18 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button type="button" className="rounded-lg text-xs leading-6 font-semibold px-2 ring-2 ring-inset ring-slate-500 text-slate-500 dark:text-slate-100 dark:ring-0 dark:bg-slate-500">
                  1x
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
            Total queues: 3
          </p>
          <div className="dark">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="mt-4">
                  <Card>
                    <div className="flex border-b py-3 cursor-pointer hover:shadow-md px-2 ">
                      <img className='w-10 h-10 object-cover rounded-lg' alt='User avatar' src='https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=200' />
                      <div className="flex flex-col px-2 w-full">
                        <span className="text-sm text-purple-400 capitalize font-semibold pt-1">
                          Song name
                        </span>
                        <span className="text-xs text-slate-400  uppercase font-medium">
                          Artist name - source
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark">
                <DropdownMenuLabel>Song name</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>
                    <RxPlay /> <span className="ml-2">Play now</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger><RxCaretSort /> <span className="ml-2">Move</span></DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="dark">
                        <DropdownMenuItem><RxDoubleArrowUp /> <span className="ml-2">Top</span></DropdownMenuItem>
                        <DropdownMenuItem><RxCaretUp /> <span className="ml-2">Up</span></DropdownMenuItem>
                        <DropdownMenuItem><RxCaretDown /> <span className="ml-2">Down</span></DropdownMenuItem>
                        <DropdownMenuItem><RxDoubleArrowDown /> <span className="ml-2">Last</span></DropdownMenuItem>
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
                <DropdownMenuItem><RxShare2 /> <span className="ml-2">Open on this device</span></DropdownMenuItem>
                <DropdownMenuItem><RxShare1 /> <span className="ml-2">Share</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RxMinusCircled /> <span className="ml-2 text-red-500">Remove form queue</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Layout>
      </>
  )
}

export default Monitor