import Service from './Service';
import mongoose from 'mongoose';
import Hashtag from '../database/model/hashtag';
import Music from '../database/model/music';
import { logger } from '../config/logger';
import { IExtractData } from '../utils/extractor';

export interface IMusicInf {
    artist: string;
    music: string;
    hashtags: [string];
    telegramId: number;
}

class MusicService extends Service {
    async addMusics(musicInformations: IMusicInf[]) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const beforeAdd = await Music.count({});
            const uniqueHashtags = [...new Set(musicInformations.flatMap((obj) => obj.hashtags))];
            await this._upsertHashtags(uniqueHashtags, session);
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

    async _upsertHashtags(hashtags, session) {
        if (hashtags.length === 0) {
            return;
        }

        const hashtag = hashtags.shift();

        await Hashtag.upsert({ hashtag: hashtag }, { hashtag: hashtag }, session);

        await this._upsertHashtags(hashtags, session);
    }

    async _processMusicInformations(musicInformations, session) {
        if (musicInformations.length === 0) {
            return;
        }

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

    async removeMusic(musicInformations: IMusicInf[]) {
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
}

export default new MusicService();
