import { z } from "zod";
// @ts-expect-error
import youtubeSearch from 'youtube-search-api';
import * as cheerio from 'cheerio';

import { createTRPCRouter, publicProcedure } from "@uta/server/api/trpc";
import { YoutubeSearchResponse } from "@uta/types/yt.types";
import { db } from "@uta/server/db";
import { observable } from '@trpc/server/observable';
import EventEmitter from "events";
const ee = new EventEmitter();
const cleanText = (text: string) => text.replace(/[\n\t]/g, '').trim()
const getCurrentQueue = async () => {
  const queue = await db.songQueue.findMany({
    where: {
      deletedAt: null,
      playedAt: null,
    },
    orderBy: {
      order: 'asc'
    }
  })
  return queue
}

export const songRouter = createTRPCRouter({
  onBroadcast: publicProcedure
    .subscription(async () => {
      return observable<string>((emit) => {
        const onAdd = (data: string) => {
          emit.next(data);
        };
        ee.on('cmd', onAdd);
        return () => {
          ee.off('cmd', onAdd);
        };
      });
    }
  ),
  //PLAYING PLAYED
  updatePlayerState: publicProcedure.
    input(z.string()).
    mutation(async ({ input }) => {
      await db.kV.upsert({
        where: {
          key: 'playerState'
        },
        create: {
          key: 'playerState',
          value: input
        },
        update: {
          value: input
        }
      })
    }),
  broadcastPlayerCommand: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await db.kV.upsert({
        where: {
          key: 'playerCommand'
        },
        create: {
          key: 'playerCommand',
          value: input
        },
        update: {
          value: input
        }
      })
      ee.emit('cmd', input)
      
      return input
    }),
  getCurrentSong: publicProcedure
    .query(async () => {
      return await db.kV.findFirst({
        where: {
          key: 'currentSong'
        }
      })
    }),
  getNextSong: publicProcedure
    .mutation(async () => {
      const queue = await getCurrentQueue()
      const next = queue.find(q => !q.playedAt)
      if (!next) {
        return null
      }
      await db.songQueue.update({
        where: {
          id: next.id
        },
        data: {
          playedAt: new Date()
        }
      })

      // Save to KV Current Song
      await db.kV.upsert({
        where: {
          key: 'currentSong'
        },
        create: {
          key: 'currentSong',
          value: next.data
        },
        update: {
          value: next.data
        }
      })
      return next
    }),
  getCurrentQueue: publicProcedure
    .query(async () => {
      return await getCurrentQueue()
    }),
  orderUp: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const queue = await getCurrentQueue()
      const index = queue.findIndex(q => q.id === input.id)
      if (index === 0) {
        return queue
      }
      const prev = queue[index - 1]
      const current = queue[index]
      if (!prev || !current) { 
        return queue
      }
      await db.songQueue.update({
        where: {
          id: current.id
        },
        data: {
          order: prev.order
        }
      })
      await db.songQueue.update({
        where: {
          id: prev.id
        },
        data: {
          order: current.order
        }
      })
      return await getCurrentQueue()
    }),
  orderDown: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const queue = await getCurrentQueue()
      const index = queue.findIndex(q => q.id === input.id)
      if (index === queue.length - 1) {
        return queue
      }
      const next = queue[index + 1]
      const current = queue[index]
      if (!next || !current) { 
        return queue
      }
      await db.songQueue.update({
        where: {
          id: current.id
        },
        data: {
          order: next.order
        }
      })
      await db.songQueue.update({
        where: {
          id: next.id
        },
        data: {
          order: current.order
        }
      })
      return await getCurrentQueue()
    }),
  addQueue: publicProcedure
    .input(z.object({ data: z.any() }))
    .mutation(async ({ input }) => {
      const queue = await getCurrentQueue()
      const last = queue[queue.length - 1]
      const order = last ? last.order + 1 : 0
      const q = await db.songQueue.create({
        data: {
          data: JSON.stringify(input.data),
          order
        }
      })
      console.log('Queue added:', q)
      return q
    }),
  removeSongFromQueue: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.songQueue.update({
        where: {
          id: input.id
        },
        data: {
          deletedAt: new Date()
        }
      })
      return await getCurrentQueue()
    }),
  addToFirstQueue: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const queue = await getCurrentQueue()
      const current = queue.find(q => q.id === input.id)
      if (!current) {
        return queue
      }
      const first = queue[0]
      if (!first) {
        return queue
      }
      await db.songQueue.update({
        where: {
          id: current.id
        },
        data: {
          order: first.order - 1
        }
      })
      return await getCurrentQueue()
    }),
  search: publicProcedure
    .input(z.object({ text: z.string(), karaoke: z.boolean().default(true) }))
    .mutation(async ({ input }) => {
      const keyword = input.karaoke ? input.text + " カラオケ KARAOKE" : input.text
      const nicoKeyword = input.karaoke ? input.text + " カラオケ" : input.text
      console.log('Search:', input.text, 'Keyword:', keyword)
      //https://nicovrc.net/proxy?https://www.nicovideo.jp/watch/sm40929392
      let nico: {
        i: number
        title: string
        href: string
        thumb: string
      }[] = []
      try {
        const res = await fetch(`https://www.nicovideo.jp/search/${encodeURIComponent(nicoKeyword)}?f_range=0&l_range=0&opt_md=&start=&end=`).then(res => res.text())
        const $ = cheerio.load(res as string);
        $('li.item').each((i, elem) => {
          const itemContent = $(elem).find('.itemContent')
          const title = $(itemContent).find('p.itemTitle').text() || ''
          const href = $(itemContent).find('p.itemTitle > a').attr('href') || ''
          const thumb = $(elem).find('.thumb').attr('src') || ''
          if(title && href && thumb) {
            nico.push({
              i,
              title: cleanText(title),
              href,
              thumb
            })
          }
        })
      } catch (e) {
        console.error(e)
      }
      const youtube = await youtubeSearch.GetListByKeyword(keyword, false, 20) as YoutubeSearchResponse
      return {
        nico,
        youtube
      };
    }),
});
