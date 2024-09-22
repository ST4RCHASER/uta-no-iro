import { createTRPCRouter, publicProcedure } from "@uta/server/api/trpc";
import { db } from "@uta/server/db";
import { observable } from '@trpc/server/observable';
import { addQueue, changeQueueOrder, getRoomHistory, playSong, removeSong } from "./room.service";
import { getYoutubeLink, search } from "./search.service";
import { z } from "zod";
import { ee } from "./room.router";

export const songRouter = createTRPCRouter({
  onBroadcast: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(async ({input}) => {
      return observable<string>((emit) => {
        const onAdd = (data: string) => {
          try { 
            const parsed = JSON.parse(data) as { roomId: string }
            if (parsed.roomId === input.roomId) { 
              emit.next(data)
            }
          }
          catch (e) { 
            console.error(`[${input.roomId}] Failed to parse broadcast event data`, e)
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
    .query(async ({ input }) => getRoomHistory(input.roomId)),
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
  getYoutubeLink: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => getYoutubeLink(input.url)),
});