import { createSocket, Socket } from 'dgram';
import { EventEmitter } from 'events';
import { cond, curry, equals } from 'ramda';
import { getMulticastAddress, getBroadcastAddress } from './utils/ipAddresses';

export enum CommChannelKind {
    BROADCAST,
    MULTICAST,
}

export interface CommChannel extends EventEmitter {
    send: (data: string) => void;
}

interface CommChannelCreator {
    (channelKind: CommChannelKind): CommChannel;
}

const COMMUNICATION_PORT = Number(process.env.PORT);

const getSocketForConnectionKind = (channelKind: CommChannelKind): Socket => {
    if (channelKind === CommChannelKind.BROADCAST) {
        const socket = createSocket('udp4');
        socket.bind(COMMUNICATION_PORT, () => {
            socket.setBroadcast(true);
        });

        return socket;
    }

    if (channelKind === CommChannelKind.MULTICAST) {
        const socket = createSocket('udp4');
        socket.bind(COMMUNICATION_PORT, '0.0.0.0', () => {
            socket.addMembership(getMulticastAddress(), '0.0.0.0');
        });

        return socket;
    }
};

const sendMessage = curry((socket: Socket, channelKind: CommChannelKind, message: string) => {
    if (channelKind === CommChannelKind.BROADCAST) {
        socket.send(message, COMMUNICATION_PORT, getBroadcastAddress());
        return;
    }

    if (channelKind === CommChannelKind.MULTICAST) {
        socket.send(message, COMMUNICATION_PORT, getMulticastAddress());
        return;
    }
});

const createCommChannel: CommChannelCreator = channelKind => {
    const socket = getSocketForConnectionKind(channelKind);

    const eventEmitter = Object.assign(new EventEmitter(), {
        send: sendMessage(socket, channelKind),
    });
    socket.on('message', buffer => {
        eventEmitter.emit('message', buffer.toString('utf-8'));
    });
    socket.on('error', error => eventEmitter.emit('error'));

    return eventEmitter;
};

export default createCommChannel;
