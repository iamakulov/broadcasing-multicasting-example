import { networkInterfaces, NetworkInterfaceInfoIPv4 } from 'os';
import { Netmask } from 'netmask';
import { compose, equals, flatten, find, pipe, pick, prop, tap, values } from 'ramda';

const getActiveInterface = () => {
    const isSpecifiedCidr = pipe(prop('cidr'), equals(process.env.CIDR_TO_USE));
    const pickActiveInterface = pipe(values, flatten, find(isSpecifiedCidr));

    return pickActiveInterface(networkInterfaces()) as NetworkInterfaceInfoIPv4;
};

export const getIpAddress = pipe(getActiveInterface, prop('address')) as () => string;

export const getCidr = pipe(getActiveInterface, prop('cidr')) as () => string;

export const getBroadcastAddress = pipe(
    getActiveInterface,
    prop('cidr'),
    (cidr: string) => new Netmask(cidr).broadcast,
) as () => string;

export const getMulticastAddress = () => process.env.MULTICAST_ADDRESS;
