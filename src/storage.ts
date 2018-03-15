import { bind } from 'ramda';

interface Storage {
    remoteIps: string[];
}

const storage: Storage = {
    remoteIps: [],
};

export const storeRemoteIp = ip => storage.remoteIps.push(ip);
export const getRemoteIps = () => storage.remoteIps;
