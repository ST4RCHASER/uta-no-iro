/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { api } from "@uta/utils/api"
import { useRouter } from "next/router"
import { useEffect } from "react"

function useRoom() {
    const router = useRouter()
    if (typeof window === "undefined") return
    // If no room code store and not in / page, redirect to / page
    const code = localStorage.getItem("room") ?? ""
    if (!code && window.location.pathname !== "/") {
        void router.push("/")
    }
    const room = api.rooms.getRoom.useQuery(code, {
        refetchInterval: 1000,
        enabled: !!code
    })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (room.isFetched) {
            if (room.data == null) {
                localStorage.removeItem("room")
                void router.push("/")
            } else {
                localStorage.setItem("room", room.data.code)
                if (room.data.states && JSON.parse(room.data.states)?.track?.title) { 
                    document.title = `Uta • ${JSON.parse(room.data.states)?.state} - ${JSON.parse(room.data.states).track.title}`
                } else {
                    document.title = `Uta • In room ${room.data.code}`
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room.data, room.isFetched])

    return room.data ? room.data : undefined
}

export { useRoom }