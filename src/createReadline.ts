import { createInterface, clearLine as readlineClearLine, cursorTo } from 'readline';
import chalk, { Chalk } from 'chalk';
import { bind, curry, pipe, tap } from 'ramda';
import { EventEmitter } from 'events';

export interface Readline extends EventEmitter {
    remote: (data: string) => void;
    error: (data: string) => void;
    info: (data: string) => void;
}

interface ReadlineCreator {
    (): Readline;
}

interface StringToString {
    (string): string;
}

const prependString = curry((dataToPrepend: string, string: string) => dataToPrepend + string);
const appendString = curry((dataToAppend: string, string: string) => string + dataToAppend);

const createReadline: ReadlineCreator = () => {
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.setPrompt(chalk.green('Message → '));
    readline.prompt();

    const clearLine = () => {
        process.stdout.write('\r\x1b[K');
    };

    const prompt = () => readline.prompt();

    const eventEmitter = Object.assign(new EventEmitter(), {
        remote: pipe(prependString(chalk.gray('Remote → ')), tap(clearLine), console.log, prompt),
        error: pipe(prependString(chalk.red('Error → ')), tap(clearLine), console.log, prompt),
        info: console.log,
    });
    readline.on('line', data => {
        eventEmitter.emit('line', data);
        readline.prompt();
    });

    return eventEmitter;
};

export default createReadline;
