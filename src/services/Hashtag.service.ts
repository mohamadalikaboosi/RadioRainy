import Service from './Service';
import Hashtag from '../database/model/hashtag';

class HashtagService extends Service {
    async upsertHashtags(hashtags, session): Promise<void> {
        if (hashtags.length === 0) {
            return;
        }

        const hashtag = hashtags.shift();

        await Hashtag.upsert({ hashtag: hashtag }, { hashtag: hashtag }, session);

        await this.upsertHashtags(hashtags, session);
    }
}

export default new HashtagService();
