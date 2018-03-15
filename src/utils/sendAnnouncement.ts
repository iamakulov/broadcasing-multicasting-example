import { curry } from 'ramda';
import { CommChannel } from '../createCommChannel';
import { storeRemoteIp } from '../storage';
import {
    convertForCommChannel,
    ServerMessageKind,
    createCommandServerMessage,
} from '../serverMessage';
import { RemoteCommand } from '../commands';
import { getIpAddress } from '../utils/ipAddresses';

export interface ExhangePayload {
    ip: string;
}

const sendAnnouncement = curry((commChannel: CommChannel, payload: ExhangePayload) => {
    const remoteMessage = createCommandServerMessage(RemoteCommand.ExchangeWithAnnouncements, {
        ip: getIpAddress(),
    });
    commChannel.send(convertForCommChannel(remoteMessage));
});

export default sendAnnouncement;
