/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@uta/server/db"
import { ee } from "./song"

export const playSong = async (roomId: string,queueId?: string) => { 
    const room = await db.room.findFirst({
        where: {
            id: roomId
        }
    })
    if (!room) {
        throw new Error('Room not found')
    }
    // If queueId is not provided, play the first song in the queue then remove that song from the queue
    if (!queueId) {
        const queue = await db.songQueue.findFirst({
            where: {
                roomId: roomId,
                playedAt: null,
                deletedAt: null
            },
            orderBy: {
                order: 'asc'
            }
        })
        if (!queue) {
            return
        }
        queueId = queue.id
    }
    const queue = await db.songQueue.findFirst({
        where: {
            id: queueId,
            playedAt: null,
            deletedAt: null
        }
    })
    if (!queue) {
        return
    }
    const data = {
        roomId: roomId,
        type: 'PLAY_TRACK',
        payload: JSON.parse(queue.data)
    }
    ee.emit('cmd', JSON.stringify(data))
    // Delete that song from the queue
    await db.songQueue.update({
        where: {
            id: queueId
        },
        data: {
            playedAt: new Date()
        }
    })
    // Reorder the queue
    const queues = await db.songQueue.findMany({
        where: {
            roomId: roomId,
            playedAt: null,
            deletedAt: null
        },
        orderBy: {
            order: 'asc'
        }
    })
    const promises = queues.map((queue, i) => {
        return db.songQueue.update({
            where: {
                id: queue.id
            },
            data: {
                order: i + 1
            }
        })
    })
    await Promise.all(promises)
    return data

}

export const changeQueueOrder = async (roomId: string, queueId: string, order: number) => { 
    const room = await db.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            queues: {
                where: {
                    playedAt: null,
                    deletedAt: null
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })
    if (!room) {
        throw new Error('Room not found')
    }
    const queue = room.queues.find(queue => queue.id === queueId)
    if (!queue) {
        throw new Error('Queue not found')
    }
    const oldOrder = queue.order
    const newOrder = order
    const newQueue: {
        id?: string
        order: number
        type: string
        data: string
    }[] = room.queues.map(item => {
        if (oldOrder < newOrder && item.order > oldOrder && item.order <= newOrder) {
            // If moving the item down, decrease the order of items in between
            return { ...item, order: item.order - 1 };
        } else if (oldOrder > newOrder && item.order >= newOrder && item.order < oldOrder) {
            // If moving the item up, increase the order of items in between
            return { ...item, order: item.order + 1 };
        }
        return item;
    });
    queue.order = newOrder

    newQueue.sort((a, b) => a.order - b.order)
    // upsert
    const promises = newQueue.map(queue => {
        return db.songQueue.upsert({
            where: {
                id: queue.id ?? ''
            },
            update: {
                order: queue.order,
            },
            create: {
                roomId: roomId,
                order: queue.order,
                type: queue.type,
                data: queue.data
            }
        })
    })

    await Promise.all(promises)
}

export const removeSong = async (roomId: string, queueId: string) => { 
    const room = await db.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            queues: {
                where: {
                    playedAt: null,
                    deletedAt: null
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })
    if (!room) {
        throw new Error('Room not found')
    }
    const queue = room.queues.find(queue => queue.id === queueId)
    if (!queue) {
        throw new Error('Queue not found')
    }
    const newQueue: {
        id?: string
        order: number
        type: string
        data: string
    }[] = room.queues.filter(item => item.id !== queueId).map(item => {
        if (item.order > queue.order) {
            return { ...item, order: item.order - 1 };
        }
        return item;
    });

    await db.songQueue.delete({
        where: {
            id: queueId
        }
    })

    newQueue.sort((a, b) => a.order - b.order)

    // upsert
    const promises = newQueue.map(queue => {
        return db.songQueue.upsert({
            where: {
                id: queue.id ?? ''
            },
            update: {
                order: queue.order,
            },
            create: {
                roomId: roomId,
                order: queue.order,
                type: queue.type,
                data: queue.data
            }
        })
    })

    await Promise.all(promises)
}

export const addQueue = async (roomId: string, order: number, type: string, data: string) => { 

    // -1 means play now
    // other number means play after that number
    const room = await db.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            queues: {
                where: {
                    playedAt: null,
                    deletedAt: null
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })
    if (!room) {
        throw new Error('Room not found')
    }
    const newQueue: {
        id?: string
        order: number
        type: string
        data: string
    }[] = room.queues.map(queue => {
        if (queue.order >= order) {
            return {
                ...queue,
                order: queue.order + 1
            }
        }
        return queue
    })

    newQueue.push({
        order: order,
        type: type,
        data: JSON.stringify(data)
    })

    newQueue.sort((a, b) => a.order - b.order)
    // upsert
    const promises = newQueue.map(queue => {
        return db.songQueue.upsert({
            where: {
                id: queue.id ?? ''
            },
            update: {
                order: queue.order,
            },
            create: {
                roomId: roomId,
                order: queue.order,
                type: queue.type,
                data: queue.data
            }
        })
    })

    await Promise.all(promises)

    //If state is idle, play the song
    if (room.states === null || JSON.parse(room.states).state === 'idle') {
        await playSong(room.id)
    }

    return newQueue
}

export const getRoomConfig = async (roomId: string) => {
    const room = await db.room.findFirst({
        where: {
            id: roomId
        }
    })
    if (!room) {
        throw new Error('Room not found')
    }

    return JSON.parse(room.config ?? '{}')
}


export const saveConfig = async (roomId: string, config: any) => {
    await db.room.update({
        where: {
            id: roomId
        },
        data: {
            config: JSON.stringify({
                ... await getRoomConfig(roomId),
                ...config
            })
        }
    })
}