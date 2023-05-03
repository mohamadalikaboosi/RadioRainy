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

export class Server {
    private port: number = Config.server.port;
    private readonly server: http.Server;
    private mongoDbName: string = Config.database.url;
    private debug = debug0('iRole-radio-rainy:server');
    private io: IOServer;

    constructor() {
        this.server = http.createServer(new App().app);
        this.io = new IOServer(this.server);
        this.checkDirectory();
        this.setMongoConnection();
        this.setServer();
        // // cron.schedule('0 0 * * *', () => {
        // this.addMusic().then(() => {
        //     logger.info('get Music from Telegram Successfully !')
        // });
        // // });
    }

    async addMusic(): Promise<void> {
        // const musicInf: IMusicInf[] = await telegramAdapter.getMusicInformation();
        // if (musicInf.length > 0) {
        //     await musicService.addMusics(musicInf);
        //     await musicService.removeMusic(musicInf);
        // }
        const music = await Music.find(
            {},
            {
                select: 'artist telegramId musicName Hashtag',
                populate: [{ path: 'Hashtag', model: 'Hashtag', select: 'hashtag' }],
            },
        );
        // const musicBuffer = await telegramAdapter.downloadFile(music[1].telegramId);
    }

    setSocketConfig() {
        // this.io.on('connection', (socket) => {
        //     // ---------------- users ----------------
        //     socket.on('users:addUser', (username) => {
        //         const id: string = socket.id;
        //         users.setUser({ id, username });
        //         this.io.emit('admin:addNewUser', { id, username });
        //     });
        //
        //     // ---------------- Admin ----------------
        //     socket.on('admin:selectMusic', (musicName) => {
        //         queue.setIsPLaying(true);
        //         queue.setPlayingTrack(musicName);
        //         io.emit('client:playSelectedSong', musicName);
        //     });
        //
        //     socket.on('admin:playButton', () => {
        //         if (!queue.getIsPLaying()) {
        //             queue.setIsPLaying(true);
        //             io.emit('client:playButton');
        //         }
        //     });
        //
        //     socket.on('admin:pauseButton', (musicInfo) => {
        //         queue.setIsPLaying(false);
        //         queue.setCurrentTime(musicInfo.currentTime);
        //         queue.setPlayingTrack(musicInfo.musicName);
        //         io.emit('client:pauseButton');
        //     });
        //
        //     socket.on('admin:songEnded', (musicName) => {
        //         queue.setIsPLaying(false);
        //         const nextMusicName = queue.nextSong(musicName);
        //         io.emit('admin:playNextSong', nextMusicName);
        //     });
        //
        //     socket.on('admin:setCurrentTime', (currentTime) => {
        //         queue.setCurrentTime(currentTime);
        //         const musicInfo = {
        //             musicName: queue.getPlayingTrack(),
        //             currentTime: queue.getCurrentTime(),
        //         };
        //         io.emit('client:playIsPlayingSong', musicInfo);
        //     });
        //
        //     // ---------------- client ---------------
        //     socket.on('client:checkPlaying', () => {
        //         if (queue.getIsPLaying()) {
        //             io.emit('admin:getCurrentTime');
        //         }
        //     });
        //
        //     socket.on('disconnect', () => {
        //         users.deleteUser(socket.id);
        //         io.emit('admin:deleteUser', socket.id);
        //     });
        // });
    }

    checkDirectory() {
        const musicDirectoryPath = './musics';
        // Check if the directory already exists
        if (fs.existsSync('./musics')) return;

        // If the directory doesn't exist, create it
        fs.mkdir(musicDirectoryPath, { recursive: true }, (err) => {
            if (err) {
                logger.info('Failed to create directory');
            }
            logger.info('Music directory created successfully!');
        });
    }

    setServer() {
        /**
         * Create HTTP server.
         */
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
