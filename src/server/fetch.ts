// Do every 24 hours
// Fetch the data from the API and save it in the database
// This will be done by a cron job

import { db } from "./db";
import fs from 'fs'
const KANY_API_URL = process.env.KANY_API_URL
type KAny = {
    songs: string[][],
}

const doUpdateKAny = async () => {
    console.log('Start processing KANY')
    if (typeof KANY_API_URL !== 'string') {
        console.log('Skip processing KANY because KANY_API_URL is not a string')
        return
    }
    
    const KAny = await fetch(KANY_API_URL);
    const KAnyData = await KAny.json() as KAny;
    // save it as file 
    fs.writeFileSync('kany.json', JSON.stringify(KAnyData, null, 2))
    // For sure he change video id or not so we need to update it every time
    let totalDo = 0
    const totals = KAnyData.songs.length
    for(const song of KAnyData.songs) {
        console.log(`[${totalDo}/${totals}] Processing song ${song[2]}`)
        if(song.length < 13 || !song[12] || !song[2]) {
            console.log('Song is not valid', song)
            continue
        }
        await db.remoteSongs.upsert({
            where: { 
                sourceName_songCode: {
                    sourceName: 'KANY',
                    songCode: song[12]
                }
            },
            create: {
                sourceName: 'KANY',
                songCode: song[12],
                title: song[2],
                artist: song[1],
                category: song[0],
                metas: JSON.stringify(song),
                karaChannel: song[5],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            update: {
                sourceName: 'KANY',
                songCode: song[12],
                title: song[2],
                artist: song[1],
                category: song[0],
                metas: JSON.stringify(song),
                karaChannel: song[5],
                updatedAt: new Date()
            }
        })
        totalDo++
        console.log(`[${totalDo}/${totals}] Done processing song ${song[2]}`)
    }
    console.log('Done processing KANY')
}

doUpdateKAny()
    .catch(err => {
        console.error('First Error while fetching KANY', err)
    })

setInterval(() => {
    doUpdateKAny()
        .catch(err => {
            console.error('Error while fetching KANY', err)
        })
}, 1000 * 60 * 60 * 24) // 24 hours