import 'dotenv/config';
import { cond, pipe, prop, propEq, tap } from 'ramda';
import * as Rx from 'rxjs/Rx';
import createCommChannel, { CommChannelKind } from './createCommChannel';
import createReadline from './createReadline';
import {
    parseServerMessage,
    ServerMessageKind,
    convertForReadline,
    convertForCommChannel,
    handleRemoteCommand,
    createChatServerMessage,
    isMessageFromOtherIp,
} from './serverMessage';
import { parseUserInput, UserInputKind, handleLocalCommand } from './userInput';
import sendAnnouncement from './utils/sendAnnouncement';
import { getIpAddress } from './utils/ipAddresses';

const init = () => {
    const communicationChannel = createCommChannel(
        process.env.CHANNEL_KIND === 'BROADCAST'
            ? CommChannelKind.BROADCAST
            : CommChannelKind.MULTICAST,
    );
    const readline = createReadline();

    Rx.Observable.fromEvent<string>(communicationChannel, 'message')
        .map(parseServerMessage)
        .filter(isMessageFromOtherIp)
        .subscribe(
            cond([
                [propEq('kind', ServerMessageKind.Chat), pipe(convertForReadline, readline.remote)],
                [
                    propEq('kind', ServerMessageKind.Command),
                    handleRemoteCommand(communicationChannel, readline),
                ],
            ]),
        );

    Rx.Observable.fromEvent<string>(readline, 'line')
        .map(parseUserInput)
        .subscribe(
            cond([
                [
                    propEq('kind', UserInputKind.Chat),
                    pipe(
                        prop('message'),
                        createChatServerMessage,
                        convertForCommChannel,
                        communicationChannel.send,
                    ),
                ],
                [
                    propEq('kind', UserInputKind.Command),
                    handleLocalCommand(communicationChannel, readline),
                ],
            ]),
        );

    communicationChannel.on('error', (error: Error) => {
        readline.error(error.toString());
    });

    sendAnnouncement(communicationChannel, {
        ip: getIpAddress(),
    });
};

init();
