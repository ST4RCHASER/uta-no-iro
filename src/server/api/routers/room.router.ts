import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@uta/server/db";
import { EventEmitter } from "events";
export const ee = new EventEmitter();

const getRandomRoomCode = async () => { 
  let limits = 100
  // Clean up old room codes
  await db.room.updateMany({
    where: {
      updatedAt: {
        lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
      }
    },
    data: {
      deletedAt: new Date()
    }
  })
  while (true) { 
    if (limits <= 0) { 
      throw new Error('Failed to generate room code')
    }
    limits -= 1
    // 4 degits number
    const code = Math.random().toString().slice(2, 6)
    const room = await db.room.findFirst({
      where: {
        code,
        deletedAt: null
      }
    })
    if (!room) { 
      return code
    }
  }
}

export const roomRouter = createTRPCRouter({
  createNewRoom: publicProcedure
    .mutation(async () => {
      return await db.room.create({
        data: {
          code: await getRandomRoomCode(),
          config: '{}'
        }
      })
    }),
  updateRoomState: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.any()
    }))
    .mutation(async ({input}) => {
      const room = await db.room.findUnique({
        where: {
          id: input.id
        }
      })
      if (!room) { 
        throw new Error('Room not found')
      }
      return await db.room.update({
        where: {
          id: input.id
        },
        data: {
          states: JSON.stringify({
            ...input.data,
            updatedAt: new Date().getTime()
          })
        }
      })
    }),
  updateRoomSetting: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.any()
    }))
    .mutation(async ({input}) => {
      const room = await db.room.findUnique({
        where: {
          id: input.id
        }
      })
      if (!room) { 
        throw new Error('Room not found')
      }
      return await db.room.update({
        where: {
          id: input.id
        },
        data: {
          config: JSON.stringify(input.data)
        }
      })
    }),
  isRoomExist: publicProcedure
    .input(z.string())
    .mutation(async ({input}) => {
      return await db.room.findFirst({
        where: {
          code: input,
          deletedAt: null
        }
      })
    }),
  getRoom: publicProcedure
    .input(z.string())
    .query(async ({input}) => {
      return await db.room.findFirst({
        where: {
          code: input,
          deletedAt: null
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
    }),
});
