import type { RoomConfig, RoomState } from "@uta/types/room.types"
import { api } from "@uta/utils/api"
import { convertQueueMeta } from "@uta/utils/convert"
import { useRouter } from "next/router"
import { useEffect } from "react"

function useRoom() {
    const router = useRouter()
    // If no room code store and not in / page, redirect to / page
    const code = typeof localStorage !== 'undefined' ? localStorage.getItem("room") ?? "" : ""
    if (!code && router.pathname !== "/") {
        if(typeof window !== "undefined") {
            void router.push("/")
        }
    }
    const room = api.rooms.getRoom.useQuery(code, {
        refetchInterval: 1000,
        enabled: !!code
    })

    let convertedStates: RoomState | null = null
    try {
        if (room.data && room.data.states) {
            convertedStates = JSON.parse(room.data.states) as RoomState
        }
    } catch {
    }

    let roomSettings: RoomConfig | null = null
    try {
        if (room.data && room.data.config) {
            roomSettings = JSON.parse(room.data.config) as RoomConfig
        }
    } catch {
    }

    useEffect(() => {
        if(typeof window === "undefined") return
        if (room.isFetched) {
            // If error
            if (room.error && room.error.message === "Room not found") {
                localStorage.removeItem("room")
                void router.push("/")
            }
            if (room.data == null) {
                localStorage.removeItem("room")
                void router.push("/")
            } else {
                localStorage.setItem("room", room.data.code)
                if (convertedStates?.track?.title) { 
                    document.title = `Uta • ${convertedStates?.state} - ${convertedStates.track.title}`
                } else {
                    document.title = `Uta • In room ${room.data.code}`
                }
            }
        }
    }, [room.data, room.isFetched])
    
    return room.data ? {
        ...room.data,
        states: convertedStates,
        config: roomSettings,
        queues: room.data.queues.map((queue) => {
            return {
                ...queue,
                data: convertQueueMeta(queue.data)
            }
        })
    } : undefined
}

export { useRoom }