export const convertQueueMeta = (queue: string) => {
    const data = JSON.parse(queue) as { i: number, title: string, id: string, thumb: string, type: string, description: string, raw: string }
    return {
        i: data.i,
        title: data.title,
        id: data.id,
        thumb: data.thumb,
        type: data.type,
        description: data.description,
        raw: data.raw
    }
}


export const getLink = (type: string, id: string) => {
    switch (type) {
        case 'youtube':
            return `https://www.youtube.com/watch?v=${id}`
        case 'niconico':
            return `https://www.nicovideo.jp${id}`
        default:
            return ''
    }
}

export const secToMinuteFormat = (sec: number) => {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    const format = `${Math.ceil(minutes).toString().padStart(2, '0')}:${Math.ceil(seconds).toString().padStart(2, '0')}`
    //If contain NaN, return 00:00
    if (format.includes('NaN')) return '00:00'
    return format
}