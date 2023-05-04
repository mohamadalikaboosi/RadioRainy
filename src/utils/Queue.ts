// Queue.ts
import { IMusicDocument } from '../database/model/music';

class Queue {
    private songs: IMusicDocument[];
    private currentSongIndex: number;

    constructor() {
        this.songs = [];
        this.currentSongIndex = 0;
    }

    loadSongs(song: IMusicDocument) {
        this.songs.push(song);
    }

    dequeue() {
        if (this.songs.length > 0) {
            this.songs.shift();
            if (this.currentSongIndex > 0) {
                this.currentSongIndex--;
            }
        }
    }

    getCurrentSong(): Song | null {
        if (this.songs.length > 0) {
            return this.songs[this.currentSongIndex];
        }
        return null;
    }

    getNextSong(): Song | null {
        if (this.currentSongIndex < this.songs.length - 1) {
            return this.songs[this.currentSongIndex + 1];
        }
        return null;
    }

    playNextSong() {
        if (this.currentSongIndex < this.songs.length - 1) {
            this.currentSongIndex++;
        }
    }

    getQueue(): IMusicDocument[] {
        return this.songs;
    }

    clearQueue() {
        this.songs = [];
        this.currentSongIndex = 0;
    }
}

export default Queue;
