import { ProxyInterface } from 'telegram/network/connection/TCPMTProxy';

export interface IExtractData {
    artist: string;
    music: string;
    hashtags: [string];
}

export function extractData(text): IExtractData {
    const artist = text.match(/^(.*?)[-–]/)[1].trim();
    const music = text.match(/[-–](.*?)\n/)[1].trim();
    const hashtags = text.match(/#(\w+)/g).map((tag) => tag.replace('#', ''));

    return {
        artist,
        music,
        hashtags,
    };
}

export function extractProxy(proxyUrl: string): ProxyInterface {
    const urlParams = new URLSearchParams(proxyUrl.split('?')[1]);
    const ip = urlParams.get('server');
    const port = parseInt(urlParams.get('port') || '0');

    if (proxyUrl.includes('/socks')) {
        return {
            ip: ip || '',
            port: port || 0,
            MTProxy: false,
            socksType: 5,
            timeout: 2,
        };
    } else if (proxyUrl.includes('/proxy')) {
        const secret = urlParams.get('secret');

        return {
            ip: ip || '',
            port: port || 0,
            secret: secret || '',
            MTProxy: true,
            timeout: 2,
        };
    } else {
        throw new Error('Invalid proxy URL');
    }
}
