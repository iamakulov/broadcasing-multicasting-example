import { Readline } from '../createReadline';
import { getRemoteIps } from '../storage';
import {
    getIpAddress,
    getCidr,
    getBroadcastAddress,
    getMulticastAddress,
} from '../utils/ipAddresses';

const getNetworkInfo = (readline: Readline) => () => {
    readline.info('Local IP: ' + getIpAddress());
    readline.info('CIRD: ' + getCidr());
    readline.info('Broadcast address: ' + getBroadcastAddress());
    readline.info('Multicast address: ' + getMulticastAddress());
    readline.info(
        'Remote IPs:\n' +
            getRemoteIps()
                .map(ip => '    ' + ip)
                .join('\n'),
    );
};

export default getNetworkInfo;
