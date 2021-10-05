import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

const SupportedSymbols = ['ethusdt', 'dotusdt'];
const SupportedIntervals = [
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '8h',
    '12h',
    '1d',
    '3d',
    '1w',
    '1M',
];

@WebSocketGateway()
export class KLineGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    allConnected: WebSocket[] = [];
    binanceConnections: WebSocket[] = [];

    handleClientMessage(message: any, clientId: string) {
        if (message === 'UNSUBSCRIBE') {
            const bCon = this.binanceConnections.find((bCon: { clientid: string } & WebSocket) => {
                return bCon.clientid === clientId
            });
            this.binanceConnections = this.binanceConnections.filter((bCon: { clientid: string } & WebSocket) => {
                return bCon.clientid !== clientId;
            });
            if (bCon) {
                bCon.close();
            }
        } else {
            const keys = message.split('@');
            const interval = keys[1].split('_')[1];
    
            if (
                SupportedSymbols.includes(keys[0]) &&
                SupportedIntervals.includes(interval)
            ) {
                const newBinanceConn: { clientid: string } & WebSocket =
                    new WebSocket(
                        `wss://stream.binance.com:9443/stream?streams=${message}`,
                    );
    
                newBinanceConn.clientid = clientId;
                this.binanceConnections.push(newBinanceConn);
    
                newBinanceConn.onmessage = (mes) => {
                    const client = this.allConnected.find(
                        (c: { id: string } & WebSocket) => c.id === clientId,
                    );
    
                    if (client) {
                        client.send(mes.data);
                    }
                };
            }
        }
    }

    handleConnection(client: any, ...args: any[]) {
        client.id = uuidv4();
        this.allConnected.push(client);
        Logger.log(`Connected Client ${client.id}`, 'KLineGateway');

        client.addEventListener('message', (message) => {
            const binanceConnForThisClient = this.binanceConnections.find(
                (bCon: { clientid: string } & WebSocket) =>
                    bCon.clientid === client.id,
            );
            this.binanceConnections = this.binanceConnections.filter(
                (bCon: { clientid: string } & WebSocket) =>
                    bCon.clientid !== client.id,
            );

            if (binanceConnForThisClient) {
                Logger.log(
                    `Closing Binance connection for ${
                        (binanceConnForThisClient as any).clientid
                    }`,
                    'KLineGateway',
                );
                binanceConnForThisClient.close();
            }

            this.handleClientMessage(message.data, client.id);
        });
    }

    handleDisconnect(client: any) {
        this.allConnected = this.allConnected.filter(
            (connectedClient: { id: string } & WebSocket) => {
                if (client.id === connectedClient.id) {
                    // connectedClient.removeEventListener(
                    //   'message',
                    //   this.handleClientMessage,
                    // );
                    connectedClient.close();
                }
                return client.id !== connectedClient.id;
            },
        );

        Logger.log(`Disconnecting ${client.id}`, 'KLineGateway');
        this.binanceConnections = this.binanceConnections.filter(
            (binanceConn: { clientid: string } & WebSocket) => {
                if (binanceConn.clientid === client.id) {
                    // binanceConn.removeEventListener('message', this.handleClientMessage);
                    binanceConn.close();
                }
                return binanceConn.clientid !== client.id;
            },
        );
    }
}
