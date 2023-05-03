import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logger } from '../config/logger';
import { extractData, extractProxy, IExtractData } from './extractor';
import input from 'input';
import { IMusicInf } from '../services/Music.service';

class TelegramAdapter {
    private session: StringSession = new StringSession(Config.telegram.session);
    private apiId: number = parseInt(Config.telegram.apiId);
    private apiHash: string = Config.telegram.apiHash;
    private channelUsername: string = Config.telegram.channelUsername;
    private client!: TelegramClient;

    async _connect() {
        this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
            connectionRetries: 5,
            useWSS: false, // Important. Most proxies cannot use SSL.
            proxy: extractProxy('https://t.me/socks?server=192.168.1.4&port=1081'),
        });
        if (!this.client.session.serverAddress) {
            await this.client.start({
                phoneNumber: async () => await input.text('Please enter your number: '),
                password: async () => await input.text('Please enter your password: '),
                phoneCode: async () => await input.text('Please enter the code you received: '),
                onError: (err) => console.log(err),
            });
            logger.info(`your TELEGRAM_SESSION = ${this.client.session.save()}`);
        }
        await this.client.connect();
        logger.info('connected to telegram Successfully');
    }

    async _getMusics() {
        await this._connect();
        const filter = new Api.InputMessagesFilterMusic();

        return await this.client.getMessages(this.channelUsername, {
            filter,
        });
    }

    async getMusicInformation(): Promise<IMusicInf[]> {
        const musics = await this._getMusics();
        const musicInfos: IMusicInf[] = [];
        for (const music of musics) {
            const data: IExtractData = extractData(music.message);
            const information = {
                ...data,
                telegramId: music.id,
            };
            musicInfos.push(information);
        }
        return musicInfos;
    }
}

export default new TelegramAdapter();
