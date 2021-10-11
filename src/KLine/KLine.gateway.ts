import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { ClientMap } from 'src/types';
import { isValidSubscription } from 'src/utils';
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

@WebSocketGateway()
export class KLineGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    clientConnections: ClientMap = {};
    binanceListeners: ClientMap = {};

    handleClientMessage(message: string, clientId: string) {
        const newBinanceConn: WebSocket = new WebSocket(
            `wss://stream.binance.com:9443/stream?streams=${message}`,
        );

        this.binanceListeners[clientId] = newBinanceConn;
        newBinanceConn.onmessage = (mes) => {
            this.clientConnections[clientId].send(mes.data);
        };
    }

    handleConnection(client: any, ...args: any[]) {
        const newId = uuidv4();
        client.id = newId;
        this.clientConnections[newId] = client;

        Logger.log(`Connected Client ${newId}`, 'KLineGateway');
        client.addEventListener('message', (message) => {
            if (message.data === 'UNSUBSCRIBE') {
                this.binanceListeners[newId].close();
                this.binanceListeners[newId] = undefined;
                Logger.log(`Unsubscribing for ${newId}`, 'KLineGateway');
            } else if (isValidSubscription(message.data)) {
                if (this.binanceListeners[newId]) {
                    this.binanceListeners[newId].close();
                    this.binanceListeners[newId] = undefined;
                }

                this.handleClientMessage(message.data, newId);
            }
        });
    }

    handleDisconnect(client: { id: string } & WebSocket) {
        Logger.log(`Disconnecting ${client.id}`, 'KLineGateway');

        if (this.binanceListeners[client.id]) {
            this.binanceListeners[client.id].close();
            this.binanceListeners[client.id] = undefined;
        }

        this.clientConnections[client.id].close();
        this.clientConnections[client.id] = undefined;
    }
}
