/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";


import { createTRPCRouter, publicProcedure } from "@uta/server/api/trpc";
import { db } from "@uta/server/db";
import { observable } from '@trpc/server/observable';
import EventEmitter from "events";
import { addQueue, changeQueueOrder, playSong, removeSong } from "./roomService";
import { search } from "./searchService";
export const ee = new EventEmitter();

export const songRouter = createTRPCRouter({
  onBroadcast: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(async ({input}) => {
      return observable<string>((emit) => {
        const onAdd = (data: string) => {
          if (JSON.parse(data).roomId === input.roomId) {
            emit.next(data);
          }
        };
        ee.on('cmd', onAdd);
        return () => {
          ee.off('cmd', onAdd);
        };
      });
    }
    ),
  broadcastPlayerCommand: publicProcedure
    .input(z.object({ roomId: z.string(), cmd: z.string() }))
    .mutation(async ({ input }) => {
      ee.emit('cmd', JSON.stringify({
        roomId: input.roomId,
        ...JSON.parse(input.cmd)
      }))
      return input
    }),
  playerEvent: publicProcedure
    .input(z.object({ roomId: z.string().optional(), event: z.string() }))
    .mutation(async ({ input }) => {
      if (!input.roomId) { 
        throw new Error('Room ID is required')
      }
      const room = await db.room.findFirst({
        where: {
          id: input.roomId
        }
      })
      if (!room) { 
        throw new Error('Room not found')
      }

      if (input.event === 'ENDED' || input.event === 'ERROR') {
        void playSong(input.roomId)
      }
      return input
    }),
  history: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input }) => {
      const history = await db.songQueue.findMany({
        where: {
          roomId: input.roomId,
          playedAt: {
            not: null
          }
        },
        orderBy: {
          playedAt: 'desc'
        }
      })
      return history
    }),
  play: publicProcedure
    .input(z.object({ roomId: z.string(), queueId: z.string().optional() }))
    .mutation(async ({ input }) => playSong(input.roomId, input.queueId)),
  changeQueueOrder: publicProcedure
    .input(z.object({ roomId: z.string(), queueId: z.string(), newQueueOrder: z.number() }))
    .mutation(async ({ input }) => changeQueueOrder(input.roomId, input.queueId, input.newQueueOrder)),
  deleteQueue: publicProcedure
    .input(z.object({ roomId: z.string(), queueId: z.string() }))
    .mutation(async ({ input }) => removeSong(input.roomId, input.queueId)),
  addToQueue: publicProcedure.
    input(z.object({ 
      roomId: z.string(),
      order: z.number(),
      type: z.string(),
      data: z.any()
    })).mutation(({ input }) => addQueue(input.roomId, input.order, input.type, input.data as string)),
  search: publicProcedure
    .input(z.object({ text: z.string(), roomId: z.string() }))
    .mutation(async ({ input }) => search(input.roomId, input.text)
  ),
});