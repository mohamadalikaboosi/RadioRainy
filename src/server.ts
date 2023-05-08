import * as http from 'http';

import debug0 from 'debug';

import { logger } from './config/logger';
import { App } from './app';
import mongoose from 'mongoose';
import cron from 'node-cron';
import telegramAdapter from './utils/TelegramAdapter';
import musicService, { IMusicInf } from './services/Music.service';
import { Server as IOServer } from 'socket.io';
import Music from './database/model/music';
import music from './database/model/music';
import fs from 'fs';
import _ from 'underscore';
import queue from './utils/Queue';

export class Server {
    private port: number = Config.server.port;
    private readonly server: http.Server;
    private mongoDbName: string = Config.database.url;
    private debug = debug0('iRole-radio-rainy:server');
    private io: IOServer;

    constructor() {
        this.server = http.createServer(new App().app);
        this.io = new IOServer(this.server, {
            cors: {
                origin: '*',
            },
        });
        this.checkDirectory();
        this.setMongoConnection();
        this.setServer();
        this.setupStream().then();
        // this.downloadMusic().then(() => {
        //     logger.info('Download Music from Telegram Successfully !');
        // });
        // // cron.schedule('0 0 * * *', () => {
        // this.addMusic().then(() => {
        //     logger.info('update Music Information from Telegram Successfully !');
        //     this.downloadMusic().then(() => {
        //         logger.info('Download Updated Music from Telegram Successfully !');
        //     });
        // });
        // // });
    }

    async addMusic(): Promise<void> {
        const musicInf: IMusicInf[] = await telegramAdapter.getMusicInformation();
        if (musicInf.length > 0) {
            await musicService.addMusics(musicInf);
            await musicService.removeMusic(musicInf);
        }
    }

    async downloadMusic(): Promise<void> {
        const telegramIds: number[] = await musicService.findAllMusicNotDownload();
        if (telegramIds.length > 0) {
            await this._downloadProcess(telegramIds);
        } else {
            logger.info('There is not Any Music For Download');
        }
    }

    private async _downloadProcess(telegramIds): Promise<void> {
        if (telegramIds.length === 0) {
            console.log('All downloads completed.');
            return;
        }

        const musicId = telegramIds.shift();

        const success = await telegramAdapter.downloadFile(musicId);
        await musicService.updateMusicPath(musicId);
        if (success) {
            console.log(`Downloaded music with telegramId: ${musicId}`);
        } else {
            console.log(`Failed to download music with telegramId: ${musicId}`);
        }

        await this._downloadProcess(telegramIds);
    }

    async setupStream() {
        await queue.loadTracks();
        queue.play(false, this.io);
    }

    checkDirectory(): void {
        // Check if the directory already exists
        if (fs.existsSync(Config.music.musicPath)) return;

        // If the directory doesn't exist, create it
        fs.mkdir(Config.music.musicPath, { recursive: true }, (err) => {
            if (err) {
                logger.info('Failed to create directory');
            }
            logger.info('Music directory created successfully!');
        });
    }

    setServer(): void {
        /**
         * Create HTTP server.
         */
        this.server.listen(this.port, () => {
            logger.info(`Server listening on port: ${this.port} Mode = ${Config.server.environment}`);
        });
        this.server.on('error', this.onError);
    }

    setMongoConnection(): void {
        //process.env.DatabaseUrl === undefined ? this.mongoDbName = process.env.DatabaseUrl : Config.database.url;
        mongoose.set('strictQuery', Config.database.strictQuery);
        mongoose
            .connect(this.mongoDbName)
            .then(() => logger.info('connect to mongoDb Database!'))
            .catch((e) => logger.info('can not connect to mongoDb Database!', e));
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    onError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = `Port ${this.port}`;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(`${bind} requires elevated privileges`, error);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(`${bind} is already in use`, error);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}
