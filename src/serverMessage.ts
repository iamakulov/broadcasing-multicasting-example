import { complement, cond, equals, pipe, prop, propEq } from 'ramda';
import { RemoteCommand } from './commands';
import { CommChannel } from './createCommChannel';
import { Readline } from './createReadline';
import exchangeWithAnnouncements from './remoteCommands/exchangeWithAnnouncements';
import { getIpAddress } from './utils/ipAddresses';

export enum ServerMessageKind {
    Chat,
    Command,
}

interface ServerMessageBase {
    kind: ServerMessageKind;
    source: string;
}

interface ChatServerMessage extends ServerMessageBase {
    kind: ServerMessageKind.Chat;
    message: string;
}

interface CommandServerMessage extends ServerMessageBase {
    kind: ServerMessageKind.Command;
    command: RemoteCommand;
    payload: any;
}

type ServerMessage = ChatServerMessage | CommandServerMessage;

interface RemoteCommandHandler {
    (communicationChannel: CommChannel, readline: Readline): ((
        commandMessage: CommandServerMessage,
    ) => void);
}

export const parseServerMessage: ((message: string) => ServerMessage) = JSON.parse;

export const convertForReadline: ((chatMessage: ChatServerMessage) => string) = prop('message');

export const convertForCommChannel: ((message: ServerMessage) => string) = JSON.stringify;

export const handleRemoteCommand: RemoteCommandHandler = (communicationChannel, readline) =>
    cond([
        [
            propEq('command', RemoteCommand.ExchangeWithAnnouncements),
            pipe(prop('payload'), exchangeWithAnnouncements(communicationChannel)),
        ],
    ]);

export const createChatServerMessage = (message: string): ChatServerMessage => ({
    kind: ServerMessageKind.Chat,
    message,
    source: getIpAddress(),
});

export const createCommandServerMessage = (
    command: RemoteCommand,
    payload: any,
): CommandServerMessage => ({
    kind: ServerMessageKind.Command,
    command,
    payload,
    source: getIpAddress(),
});

export const isMessageFromOtherIp: (message: ServerMessage) => boolean = pipe(
    prop('source'),
    complement(equals(getIpAddress())),
);
