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
    useEffect(() => {
        if (room.isFetched) {
            if (room.data == null) {
                localStorage.removeItem("room")
                void router.push("/")
            } else {
                localStorage.setItem("room", room.data.code)
                // Set title
                document.title = `Uta - In room ${room.data.code}`
            }
        }
    }, [room.data, room.isFetched])

    return room.data ? room.data : undefined
}

export { useRoom }