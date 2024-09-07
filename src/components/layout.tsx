import { useDeviceType } from "@uta/hooks/useDeviceType";
import { useRoom } from "@uta/hooks/useRoom";
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RxLaptop, RxMix, RxPerson, RxPlay, RxReset, RxRows, RxTokens } from "react-icons/rx";
export function Layout({ children, title, description}: { children: React.ReactNode, title?: string, description?: string }) {
    const room = useRoom()
    const router = useRouter()

    const [isInPlayerPage, setIsInPlayerPage] = useState(false)
    useEffect(() => {
        setIsInPlayerPage(router.pathname === '/player')
    }, [router.pathname])

    const isMobileOrTablet = useDeviceType() !== 'Desktop'

    return (
        <>
            <Head>
                <title>Uta no iro • Operating</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="dark">
                <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600 transition-all duration-300 translate-y-0 sm:translate-y-full">
                    <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                        <Link href="/remote" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group text-white">
                            <RxMix className="text-2xl" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-500">Remote</span>
                        </button>
                    </Link>
                        <Link href="/search" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group text-white">
                            <RxRows className="text-2xl" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-500">Search</span>
                        </button>
                    </Link>
                        <Link href="/history" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group text-white">
                            <RxReset className="text-2xl" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-500">History</span>
                        </button>
                        </Link>
                        <Link href="/settings" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group text-white">
                                <RxTokens className="text-2xl" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-500">Settings</span>
                            </button>
                        </Link>
                        
                    </div>
                </div>
                <aside id="cta-button-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen -translate-x-full sm:translate-x-0 dark hover:opacity-100 transition-all duration-300 ${
                    isInPlayerPage ? 'opacity-0' : 'opacity-100'
                    }`} aria-label="Sidebar">
                    <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                        <div className="w-full overflow-ellipsis overflow-hidden text-center">
                            <div className="flex items-center justify-center py-4 text-white font-bold mx-auto mb-2 rounded-lg bg-gradient-to-tr from-green-500 to-green-900 text-3xl relative">
                                <span className="absolute top-0 left-0 text-xs text-white font-light px-2 py-1 rounded-full">Room code</span>
                                {room?.code}
                            </div>
                            <div className="flex relative overflow-hidden whitespace-nowrap px-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300 ">
                                <div className=" bg-gray-100 dark:bg-gray-700 absolute z-10 pl-1 pt-1 pb-1 -ml-2">
                                    <RxPlay />
                                </div>
                                <div className="inline-block animate-marquee-infinite">
                                    <span>{
                                       room?.states?.track?.title ?? "No track playing"
                                    }</span>  
                                </div>
                            </div>
                        </div>
                        <div className=" border-gray-500 my-3 border-t"></div>
                        <ul className="space-y-2 font-medium">
                            {
                                !isMobileOrTablet && (!room?.states || room?.states && room?.states.updatedAt < Date.now() - 3000) && (
                                    <li>
                                        <Link href="/player" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                            <RxLaptop />
                                            <span className="ms-3">Player</span>
                                        </Link>
                                    </li>
                                )
                            }
                            <li>
                                <Link href="/remote" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    <RxMix />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Remote</span>
                                    <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">{ room?.queues?.length ?? 0 }</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    <RxRows />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Search</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/history" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    <RxReset />
                                    <span className="flex-1 ms-3 whitespace-nowrap">History</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/users" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    <RxPerson />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/settings" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                     <RxTokens />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Settings</span>
                                </Link>
                            </li>
                        </ul>
                        <div id="dropdown-cta" className="p-4 mt-6 rounded-lg bg-purple-50 dark:bg-purple-900" role="alert">
                            <div className="flex items-center mb-3">
                                <span className="bg-orange-100 text-orange-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">Beta</span>
                                <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-purple-50 inline-flex justify-center items-center w-6 h-6 text-purple-900 rounded-lg focus:ring-2 focus:ring-purple-400 p-1 hover:bg-purple-200 dark:bg-purple-900 dark:purple-purple-400 dark:hover:bg-purple-800" data-dismiss-target="#dropdown-cta" aria-label="Close">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mb-3 text-sm text-purple-800 dark:text-purple-400">
                                This in beta and under active development. <br />
                                All bugs and issues should be reported to maintainers.
                            </p>
                            <a className="text-sm text-purple-800 underline font-medium hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300" href="#">
                                Go to repository
                            </a>
                        </div>
                    </div>
                </aside>
                <div className="dark bg-[#09090B] text-white sm:ml-64 p-8 min-h-screen">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            {title ?? "Uta no iro"}
                        </h1>
                        <p className="opacity-70">
                            {description ?? "description here"}
                        </p>
                    </div>
                    <div>
                        {children}
                    </div>
                </div>
            </main>
        </>
    )
}

export default Layout