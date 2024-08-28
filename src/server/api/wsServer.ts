
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { createTRPCContext } from './trpc';
import { appRouter } from './root'
const wss = new WebSocketServer({
    port: 45021,
});
const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: createTRPCContext as any,
    // Enable heartbeat messages to keep connection open (disabled by default)
    keepAlive: {
        enabled: true,
        // server ping message interval in milliseconds
        pingMs: 3000,
        // connection is terminated if pong message is not received in this many milliseconds
        pongWaitMs: 5000,
    },
});
wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once('close', () => {
        console.log(`➖➖ Connection (${wss.clients.size})`);
    });
});
console.log('✅ WebSocket Server listening on wsw://localhost:45021');
process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
});
