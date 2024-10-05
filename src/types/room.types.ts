import type { convertQueueMeta } from "@uta/utils/convert";

export type Track = ReturnType<typeof convertQueueMeta> & { sec: number, ch_vol: number, mas_vol: number, karaChannel: 'L' | 'R' | 'UNSUPORTED' } | null
export type RoomState = {
    state: 'idle' | 'playing' | 'paused' | 'loading';
    track: Track
    currentTime?: number
    masterVolume?: number
    audioChannelVolume?: number
    duration?: number
    updatedAt: number
}



export type RoomConfig = {
    allowSearchYoutube: boolean
    allowSearchNiconico: boolean
    allowSearchRemote: boolean
    searchSuffix: string
    alwaysAddEngSuffix: boolean
}

export type FakeYoutubeVideoPlayer = {
    setVolume: (vol: number) => void
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (sec: number) => void
    playerInfo: {
        currentTime: number
        duration: number
    }
}