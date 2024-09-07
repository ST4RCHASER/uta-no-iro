/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error - no types
import youtubeSearch from 'youtube-search-api';
import * as cheerio from 'cheerio';
import langdetect from 'langdetect';
import { getRoomConfig } from './roomService';
import type { YoutubeSearchResponse } from '@uta/server/types/yt.types';

const cleanText = (text: string) => text.replace(/[\n\t]/g, '').trim()
export const search = async (roomId: string, text: string) => { 
    const config = await getRoomConfig(roomId)
    const allowYoutube = typeof config.allowSearchYoutube === 'undefined' ? true : config.allowSearchYoutube
    const allowNiconico = typeof config.allowSearchNiconico === 'undefined' ? true : config.allowSearchNiconico
    let keyword = text
    if (config.searchSuffix !== 'off') {
        if (config.searchSuffix === 'auto' || !config.searchSuffix) {
            const langs = langdetect.detect(keyword)
            console.log(`[${roomId}] Detected language:`, langs)
            if (langs && langs.length !== 0) {
                switch (langs[0]?.lang) {
                    case 'ja':
                        config.searchSuffix = '1'
                        break
                    case 'zh':
                        config.searchSuffix = '2'
                        break
                    case 'ko':
                        config.searchSuffix = '3'
                        break
                    case 'th':
                        config.searchSuffix = '4'
                        break
                    default:
                        config.searchSuffix = '0'
                }
            } else {
                config.searchSuffix = '0'
            }
        }
        switch (config.searchSuffix) {
            case '0': // Eng 
                keyword += ' KARAOKE'
                break
            case '1': // Jp
                keyword += ' カラオケ'
                break
            case '2': // Chinese
                keyword += ' 卡拉OK'
                break
            case '3': // Korean
                keyword += ' 노래방'
                break
            case '4': // Thai
                keyword += ' คาราโอเกะ'
                break
            default:
                keyword += ` ${config.searchSuffix}`
        }
    }
    if (config.alwaysAddEngSuffix && config.searchSuffix !== '0' && config.searchSuffix !== 'KARAOKE') {
        keyword += ' KARAOKE'
    }
    console.log(`[${roomId}] Searching for:`, keyword)
    //https://nicovrc.net/proxy?https://www.nicovideo.jp/watch/sm40929392
    const songs: {
        i: number
        title: string
        id: string
        thumb: string
        type: 'youtube' | 'niconico'
        description: string
        raw?: object
    }[] = []
    if (allowNiconico) {
        try {
            const res = await fetch(`https://www.nicovideo.jp/search/${encodeURIComponent(keyword)}?f_range=0&l_range=0&opt_md=&start=&end=`).then(res => res.text())
            const $ = cheerio.load(res);
            $('li.item').each((i, elem) => {
                const itemContent = $(elem).find('.itemContent')
                const title = $(itemContent).find('p.itemTitle').text() ?? ''
                const href = $(itemContent).find('p.itemTitle > a').attr('href') ?? ''
                const thumb = $(elem).find('.thumb').attr('src') ?? ''
                const length = $(elem).find('.videoLength').text() ?? ''
                const time = $(elem).find('.time').text() ?? ''
                if (title && href && thumb) {
                    songs.push({
                        i,
                        title: cleanText(title),
                        id: href,
                        thumb,
                        type: 'niconico',
                        description: `${time}  •  ${length}`
                    })
                }
            })
        } catch (e) {
            console.error(e)
        }
    }
    if (allowYoutube) {
        const youtube = await youtubeSearch.GetListByKeyword(keyword, false, 40) as YoutubeSearchResponse
        youtube.items.forEach((item, i) => {
            if (item.type !== 'channel') {
                songs.push({
                    i: ++i,
                    title: cleanText(item.title),
                    id: item.id,
                    thumb: item.thumbnail.thumbnails[0]?.url ?? '',
                    type: 'youtube',
                    description: `${item.isLive ? '[LIVE] ' : ''}${item.channelTitle}  •  ${item.length.simpleText}`,
                    raw: item
                })
            }
        })
    }
    // Sort it by title need keyword karaoke to be at the top
    // List keyword KARAOKE karaoke instrumental カラオケ 卡拉OK 노래방 คาราโอเกะ
    const order = ['karaoke', 'offvocal', 'カラオケ', '卡拉OK', '노래방', 'คาราโอเกะ', 'onvocal', 'instrumental', 'lyrics', 'inst']
    if (songs.length === 0) return []
    const sorted = songs.sort((a, b) => {
        // Find the index of the keyword in `keywords` array for `a`
        const aIndex = order.findIndex(keyword => a.title.toLowerCase().includes(keyword.toLowerCase()));
        // Find the index of the keyword in `keywords` array for `b`
        const bIndex = order.findIndex(keyword => b.title.toLowerCase().includes(keyword.toLowerCase()));

        // If `a` has a keyword and `b` does not, `a` should come first
        if (aIndex !== -1 && bIndex === -1) return -1;
        // If `b` has a keyword and `a` does not, `b` should come first
        if (aIndex === -1 && bIndex !== -1) return 1;
        // If both `a` and `b` have keywords, the one with the lower index in `keywords` should come first
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

        // If neither `a` nor `b` have a keyword, keep the original order
        return 0;
    });
    return config.searchSuffix !== 'off' ? sorted : songs
}