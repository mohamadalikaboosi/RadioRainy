import Service from './Service';
import mongoose from 'mongoose';
import Hashtag from '../database/model/hashtag';
import Music from '../database/model/music';
import { logger } from '../config/logger';
import hashtagService from './Hashtag.service';
import _ from 'underscore';

export interface IMusicInf {
    artist: string;
    music: string;
    hashtags: [string];
    telegramId: number;
}

class MusicService extends Service {
    async addMusics(musicInformations: IMusicInf[]): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const beforeAdd = await Music.count({});
            const uniqueHashtags = [...new Set(musicInformations.flatMap((obj) => obj.hashtags))];
            await hashtagService.upsertHashtags(uniqueHashtags, session);
            await this._processMusicInformations([...musicInformations], session);
            await session.commitTransaction();
            const afterAdd = await Music.count({});
            logger.info(`${afterAdd - beforeAdd} music upsert in database !`);
        } catch (e) {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }

    private async _processMusicInformations(musicInformations, session): Promise<void> {
        if (musicInformations.length === 0) return;

        const info = musicInformations.shift();

        const hashtags = await Hashtag.find({ hashtag: info.hashtags }, { session });
        const hashtagIds = hashtags.map((hashtag) => hashtag._id);
        const music = {
            artist: info.artist,
            musicName: info.music,
            Hashtag: hashtagIds,
            telegramId: info.telegramId,
        };

        await Music.upsert({ telegramId: info.telegramId }, music, session);

        await this._processMusicInformations(musicInformations, session);
    }

    async removeMusic(musicInformations: IMusicInf[]): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const telegramIds: number[] = musicInformations.map((info) => info.telegramId);
            const musics = await Music.count({ telegramId: { $nin: telegramIds } });
            // Remove documents that don't have telegramId in musicInformations
            await Music.deleteMany({ telegramId: { $nin: telegramIds } }, { session });
            await session.commitTransaction();
            logger.info(`${musics} music delete in database !`);
        } catch (e) {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }

    async findAllMusicNotDownload(): Promise<number[]> {
        const musics = await Music.find({ filePath: null }, { select: 'telegramId' });
        return musics.map((music) => music.telegramId);
    }

    async findMusicsRandom() {
        return _.shuffle(
            await Music.find(
                {},
                {
                    select: 'artist telegramId musicName Hashtag',
                    populate: [{ path: 'Hashtag', model: 'Hashtag', select: 'hashtag' }],
                },
            ),
        );
    }

    async updateMusicPath(telegramId) {
        await Music.findOneAndUpdate({ telegramId }, { filePath: `/${telegramId}.mp3` });
    }
}

export default new MusicService();
