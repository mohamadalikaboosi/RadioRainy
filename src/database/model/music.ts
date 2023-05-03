import { Document, model, Schema, Types } from 'mongoose';
import Repository from '../Repository';
import { HashtagModel } from './hashtag';

export interface IMusicDocument extends Document {
    telegramId: number;
    filePath: string;
    artist: string;
    musicName: string;
    Hashtag: Types.ObjectId[];
}

class Music extends Repository<IMusicDocument> {
    constructor() {
        super(MusicModel);
    }
}

const musicSchema = new Schema<IMusicDocument>(
    {
        telegramId: { type: Number, required: true, index: true },
        filePath: { type: String, required: false },
        artist: { type: String, required: true },
        musicName: { type: String, required: true },
        Hashtag: [{ type: Types.ObjectId, ref: HashtagModel, required: true }],
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            },
            versionKey: false, // __v : 0
        },
    },
);
musicSchema.loadClass(Music);

const MusicModel = model<IMusicDocument>('Music', musicSchema);

export { MusicModel };

export default new Music();
