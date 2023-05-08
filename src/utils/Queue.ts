import { v4 as uuid } from 'uuid';
import { PassThrough } from 'stream';
import Throttle from 'throttle';
import { ffprobe } from '@dropb/ffprobe';
import ffprobeStatic from 'ffprobe-static';
import { createReadStream } from 'fs';
import { join } from 'path';
import musicService from '../services/Music.service';

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
    private tracks: TrackInfo[];
    private index: number;
    private currentTrack!: TrackInfo | null;
    private playing!: boolean;
    private throttle: Throttle | null;
    private stream!: NodeJS.ReadableStream;
    public bufferHeader: any;

    constructor() {
        this.tracks = [];
        this.index = 0;
        this.clients = new Map<string, PassThrough>();
        this.bufferHeader = null;
    }
    public current(): TrackInfo | null {
        return this.tracks[this.index] || null;
    }

    public broadcast(chunk: any): void {
        this.clients.forEach((client) => {
            client.write(chunk);
        });
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

    public async loadTracks(): Promise<void> {
        const tracks = await musicService.findMusicsRandom();
        // Add directory name back to filenames
        const musicsInf = tracks.map((track) => {
            return {
                filePath: join(Config.music.musicPath, track.filePath),
                telegramId: track.telegramId,
                artist: track.artist,
                musicName: track.musicName,
                Hashtag: [...track.Hashtag],
            };
        });

        const promises = musicsInf.map(async (musicInf) => {
            const bitrate = await this.getTrackBitrate(musicInf.filePath);
            return {
                filePath: musicInf.filePath,
                bitrate,
                telegramId: musicInf.telegramId,
                artist: musicInf.artist,
                musicName: musicInf.musicName,
                Hashtag: musicInf.Hashtag,
            };
        });

        this.tracks = await Promise.all(promises);
        console.log(`Loaded ${this.tracks.length} tracks`);
    }

    private async getTrackBitrate(filePath: string): Promise<number> {
        const data = await ffprobe(filePath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    private getMusicInfo(trackInfo: TrackInfo | null) {
        if (!trackInfo) return null;
        const { telegramId, artist, musicName, Hashtag } = trackInfo;
        const hashtags = Hashtag.map((obj) => Object.values(obj)[1]) as string[];

        return { telegramId, artist, musicName, hashtags };
    }

    private getNextTrack(): void {
        if (this.index >= this.tracks.length - 1) {
            this.index = 0;
        }
        this.currentTrack = this.tracks[this.index++];
    }

    public resume(io): void {
        if (!this.started() || this.playing) return;
        console.log('Resumed');
        this.start(io);
    }

    public started(): boolean {
        return this.stream && this.throttle && this.currentTrack;
    }

    // Play new track if there's no current track or useNewTrack is true
    // Otherwise, resume the current track
    play(useNewTrack = false, io) {
        // Move the event listener registration outside the function
        // Only execute the following code if useNewTrack is true or no current track is set
        if (useNewTrack || !this.currentTrack) {
            console.log('Playing new track');
            this.getNextTrack();
            this.loadTrackStream();
            io.emit('currentMusicInfo', this.getMusicInfo(this.currentTrack));
            this.start(io);
        } else {
            io.emit('currentMusicInfo', this.getMusicInfo(this.currentTrack));
            this.resume(io);
        }
    }

    // Get the stream from the filepath
    loadTrackStream() {
        const track = this.currentTrack;
        if (!track) return;
        console.log('Starting audio stream');
        this.stream = createReadStream(track.filePath);
    }

    private async start(io): Promise<void> {
        const track = this.currentTrack;
        if (!track) return;
        this.playing = true;
        this.throttle = new Throttle(track.bitrate / 8);
        this.stream
            .pipe(this.throttle)
            .on('data', (chunk) => this.broadcast(chunk))
            .on('end', () => this.play(true, io))
            .on('error', () => this.play(true, io));
    }
}

export default new Queue();
