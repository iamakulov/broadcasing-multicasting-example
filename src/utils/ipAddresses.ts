import { networkInterfaces, NetworkInterfaceInfoIPv4 } from 'os';
import { Netmask } from 'netmask';
import { compose, flatten, filter, pipe, pick, prop, tap, values } from 'ramda';

const getActiveInterface = () => {
    const isPublicIpv4 = val => val.family === 'IPv4' && !val.internal;
    const pickActiveInterface = pipe(values, flatten, filter(isPublicIpv4), prop('0'));

    return pickActiveInterface(networkInterfaces()) as NetworkInterfaceInfoIPv4;
};

export const getIpAddress = pipe(getActiveInterface, prop('address')) as () => string;

export const getCidr = pipe(getActiveInterface, prop('cidr')) as () => string;

export const getBroadcastAddress = pipe(
    getActiveInterface,
    prop('cidr'),
    (cidr: string) => new Netmask(cidr).broadcast,
) as () => string;

export const getMulticastAddress = () => '224.0.1.3';
