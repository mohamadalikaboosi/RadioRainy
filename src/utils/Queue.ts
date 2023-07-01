import { v4 as uuid } from 'uuid';
import { PassThrough } from 'stream';
import Throttle from 'throttle';
import { ffprobe } from '@dropb/ffprobe';
import ffprobeStatic from 'ffprobe-static';
import { createReadStream } from 'fs';
import { join } from 'path';
import musicService from '../services/Music.service';
import { Server as IOServer } from 'socket.io';
import { logger } from '../config/logger';

ffprobe.path = ffprobeStatic.path;

interface Client {
    id: string;
    client: PassThrough;
}

interface TrackInfo {
    filePath: string;
    bitrate: number;
    telegramId: number;
    artist: string;
    musicName: string;
    Hashtag: object[];
}

class Queue {
    private clients: Map<string, PassThrough>;
    private readonly tracks: TrackInfo[];
    private index: number;
    private currentTrack!: TrackInfo | null;
    private playing!: boolean;
    private throttle: Throttle | null;
    private stream!: NodeJS.ReadableStream;
    public bufferHeader: any;
    private io!: IOServer;
    private sendSocket: boolean = false;

    constructor() {
        this.tracks = [];
        this.index = 0;
        this.clients = new Map<string, PassThrough>();
        this.bufferHeader = null;
    }

    public current(): TrackInfo {
        return this.tracks[this.index];
    }

    public broadcast(chunk: any): void {
        this.clients.forEach((client) => {
            client.write(chunk);
        });
        if (this.sendSocket) {
            this.sendSocket = false;
            this.io.on('connection', () => {
                this.io.emit('currentMusicInfo', this.getMusicInfo());
            });
        }
    }

    public addClient(): Client {
        const id = uuid();
        const client = new PassThrough();
        this.clients.set(id, client);
        return { id, client };
    }

    public removeClient(id: string): void {
        this.clients.delete(id);
    }

    private async getTrackBitrate(filePath: string): Promise<number> {
        const data = await ffprobe(filePath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    public getMusicInfo() {
        if (!this.currentTrack) return null;
        const { telegramId, artist, musicName, Hashtag } = this.currentTrack;
        const hashtags = Hashtag.map((obj) => Object.values(obj)[1]) as string[];

        return { telegramId, artist, musicName, hashtags };
    }

    public async SettingUp(io) {
        this.setIo(io);
        await this.loadTracks();
        this.play();
    }

    private setIo(io: IOServer) {
        this.io = io;
    }

    private async loadTracks(): Promise<void> {
        const tracks = await musicService.findMusicsRandom();
        // Add directory name back to filenames
        for (const track of tracks) {
            this.tracks.push({
                bitrate: await this.getTrackBitrate(join(Config.music.musicPath, track.filePath)),
                filePath: join(Config.music.musicPath, track.filePath),
                telegramId: track.telegramId,
                artist: track.artist,
                musicName: track.musicName,
                Hashtag: [...track.Hashtag],
            });
        }
        logger.info(`Loaded ${this.tracks.length} tracks`);
    }

    play(useNewTrack = false) {
        // Move the event listener registration outside the function
        // Only execute the following code if useNewTrack is true or no current track is set
        if (useNewTrack || !this.currentTrack) {
            if (useNewTrack) logger.info('Playing new track');
            this.getNextTrack();
            this.loadTrackStream();
            this.start();
        } else {
            this.resume();
        }
    }

    private getNextTrack(): void {
        this.sendSocket = true;
        if (this.index >= this.tracks.length - 1) {
            this.index = 0;
        }
        this.currentTrack = this.tracks[this.index++];
    }

    loadTrackStream() {
        const track = this.currentTrack;
        if (!track) return;
        logger.info('Starting audio stream');
        this.playing = true;
        this.stream = createReadStream(track.filePath);
    }

    private start(): void {
        const track = this.currentTrack;
        if (!track) return;
        this.playing = true;
        this.throttle = new Throttle(track.bitrate / 8);
        this.throttle.on('data', (chunk) => this.broadcast(chunk)).on('error', () => this.play(true));
        this.stream.pipe(this.throttle).on('end', () => this.play(true)); // Listen for the 'end' event of the stream
    }

    public resume(): void {
        if (!this.started() || this.playing) return;
        logger.info('Resumed');
        this.start();
    }

    public started(): boolean {
        return this.stream && this.throttle && this.currentTrack;
    }
}

export default new Queue();
