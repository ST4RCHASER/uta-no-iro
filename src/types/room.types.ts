import type { convertQueueMeta } from "@uta/utils/convert";

export type Track = ReturnType<typeof convertQueueMeta> & { sec: number } | null
export type RoomState = {
    state: 'idle' | 'playing' | 'paused' | 'loading';
    track: Track
    currentTime?: number
    duration?: number
    updatedAt: number
}



export type RoomConfig = {
    allowSearchYoutube: boolean
    allowSearchNiconico: boolean
    searchSuffix: string
    alwaysAddEngSuffix: boolean
}

export type FakeYoutubeVideoPlayer = {
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (sec: number) => void
    playerInfo: {
        currentTime: number
        duration: number
    }
}