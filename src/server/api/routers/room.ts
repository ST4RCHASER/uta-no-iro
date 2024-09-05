import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@uta/server/db";

const getRandomRoomCode = async () => { 
  let limits = 100
  while (true) { 
    if (limits <= 0) { 
      throw new Error('Failed to generate room code')
    }
    limits -= 1
    // 4 degits number
    const code = Math.random().toString().slice(2, 6)
    const room = await db.room.findFirst({
      where: {
        code
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
  isRoomExist: publicProcedure
    .input(z.string())
    .mutation(async ({input}) => {
      return await db.room.findFirst({
        where: {
          code: input
        }
      })
    }),
  getRoom: publicProcedure
    .input(z.string())
    .query(async ({input}) => {
      return await db.room.findFirst({
        where: {
          code: input
        }
      })
    }),
});