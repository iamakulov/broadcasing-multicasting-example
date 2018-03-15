import { cond, curry, ifElse, pipe, propEq } from 'ramda';
import { LocalCommand } from './commands';
import getNetworkInfo from './localCommands/getNetworkInfo';
import { CommChannel } from './createCommChannel';
import { Readline } from './createReadline';

export enum UserInputKind {
    Chat,
    Command,
}

interface UserInputBase {
    kind: UserInputKind;
}

interface ChatUserInput extends UserInputBase {
    kind: UserInputKind.Chat;
    message: string;
}

interface CommandUserInput extends UserInputBase {
    kind: UserInputKind.Command;
    command: LocalCommand;
}

type UserInput = ChatUserInput | CommandUserInput;

const parseUserCommand = (text: string): CommandUserInput => {
    const kindByCommand = {
        network: LocalCommand.GetNetworkInfo,
    };

    return {
        kind: UserInputKind.Command,
        command: kindByCommand[text.slice(1)],
    };
};

const parseUserChat = (text: string): ChatUserInput => ({
    kind: UserInputKind.Chat,
    message: text,
});

const stringStartsWith = curry((withWhat: string, str: string) => str.startsWith(withWhat));

export const parseUserInput: ((text: string) => UserInput) = ifElse(
    stringStartsWith('/'),
    parseUserCommand,
    parseUserChat,
);

export const handleLocalCommand = (communicationChannel: CommChannel, readline: Readline) =>
    // prettier-ignore
    cond([
        [propEq('command', LocalCommand.GetNetworkInfo), getNetworkInfo(readline)]
    ]);
