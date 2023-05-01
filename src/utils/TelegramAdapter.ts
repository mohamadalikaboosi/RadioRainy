import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logger } from '../config/logger';
import extractData from './captionExtractor';

class TelegramAdapter {
    private session: StringSession = new StringSession(Config.telegram.session);
    private apiId: number = parseInt(Config.telegram.apiId);
    private apiHash: string = Config.telegram.apiHash;
    private channelUsername: string = Config.telegram.channelUsername;
    private client!: TelegramClient;

    async _connect() {
        this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
            connectionRetries: 5,
        });
        await this.client.connect();
        logger.info('connected to telegram Successfully');
    }

    async _getMusics(offsetDate: number | undefined) {
        await this._connect();
        const filter = new Api.InputMessagesFilterMusic();
        if (offsetDate) {
            return await this.client.getMessages(this.channelUsername, {
                offsetDate,
                filter,
            });
        } else {
            return await this.client.getMessages(this.channelUsername, {
                filter,
            });
        }
    }

    async getMusicInformation(offsetDate: number | undefined = undefined) {
        const musics = await this._getMusics(offsetDate);
        const musicInfos: any = [];
        for (const music of musics) {
            const data = extractData(music.message);
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
