import Service from './Service';

export interface IMusicInf {
    artist: string;
    music: string;
    hashtags: [string];
    telegramId: number;
}

class MusicService extends Service {
    addMusic(musicInformations: [IMusicInf]) {}

    removeMusic() {}
}

export default new MusicService();
