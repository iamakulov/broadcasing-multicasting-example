import { complement, contains, curry, flip, pipe, prop, when } from 'ramda';
import { CommChannel } from '../createCommChannel';
import { storeRemoteIp, getRemoteIps } from '../storage';
import {
    convertForCommChannel,
    ServerMessageKind,
    createCommandServerMessage,
} from '../serverMessage';
import { RemoteCommand } from '../commands';
import { getIpAddress } from '../utils/ipAddresses';
import sendAnnouncement, { ExhangePayload } from '../utils/sendAnnouncement';

const isInArray = flip(contains);
const notInArray = pipe(isInArray, complement);

const exchangeWithAnnouncements = (commChannel: CommChannel) =>
    when(pipe(prop('ip'), notInArray(getRemoteIps())), (payload: ExhangePayload) => {
        storeRemoteIp(payload.ip);
        sendAnnouncement(commChannel, payload);
    });

export default exchangeWithAnnouncements;
