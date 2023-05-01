import * as http from 'http';

import debug0 from 'debug';

import { logger } from './config/logger';
import { App } from './app';
import mongoose from 'mongoose';
import cron from 'node-cron';
import telegramAdapter from './utils/TelegramAdapter';
import musicService from './services/Music.service';

export class Server {
    port: number = Config.server.port;
    server: any;
    mongoDbName: string = Config.database.url;
    debug = debug0('iRole-radio-rainy:server');

    constructor() {
        this.setMongoConnection();
        this.setServer();
        // cron.schedule('0 0 * * *', () => {
        this.addMusic().then((result) => {});
        // });
    }

    async addMusic() {
        const musicInf = await telegramAdapter.getMusicInformation();
        await musicService.addMusic(musicInf);
        return null;
    }

    setServer() {
        /**
         * Create HTTP server.
         */
        this.server = http.createServer(new App().app);
        this.server.listen(this.port, () => {
            logger.info(`Server listening on port: ${this.port} Mode = ${Config.server.environment}`);
        });
        this.server.on('error', this.onError);
    }

    setMongoConnection() {
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
    onError(error: any) {
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
