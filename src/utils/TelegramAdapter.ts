import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logger } from '../config/logger';
import { extractData, extractProxy, IExtractData } from './extractor';
import input from 'input';
import { IMusicInf } from '../services/Music.service';
import fs from 'fs';
import { ffmegCompress } from './ffmeg';

class TelegramAdapter {
    private session: StringSession = new StringSession(Config.telegram.session);
    private apiId: number = parseInt(Config.telegram.apiId);
    private apiHash: string = Config.telegram.apiHash;
    private channelUsername: string = Config.telegram.channelUsername;
    private client!: TelegramClient;

    private async _connect() {
        if (!this.client) {
            this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
                connectionRetries: 5,
                useWSS: false, // Important. Most proxies cannot use SSL.
                // proxy: extractProxy('https://t.me/socks?server=192.168.43.1&port=1081'),
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
    }

    private async _getMusics() {
        await this._connect();
        return await this.client.getMessages(this.channelUsername, {
            filter: new Api.InputMessagesFilterMusic(),
            limit: 3,
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

    async downloadFile(telegramId: number): Promise<boolean | undefined> {
        await this._connect();
        const music = await this.client.getMessages(this.channelUsername, {
            ids: telegramId,
        });
        const media = music[0].media;
        const filePathOrg = `${Config.music.musicPath}\\${telegramId}-orginal.mp3`;
        const filePath = `${Config.music.musicPath}\\${telegramId}.mp3`;

        if (media) {
            if (fs.existsSync(filePath)) return true;

            const buffer = await this.client.downloadMedia(media);
            if (buffer) {
                await ffmegCompress(buffer, filePathOrg, filePath);
                fs.unlinkSync(filePathOrg);
                return true;
            } else {
                await this.downloadFile(telegramId);
            }
        }
    }
}

export default new TelegramAdapter();
