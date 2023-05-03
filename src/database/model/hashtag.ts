import { Document, model, Schema } from 'mongoose';
import Repository from '../Repository';

export interface IHashtagDocument extends Document {
    hashtag: string;
}

class Hashtag extends Repository<IHashtagDocument> {
    constructor() {
        super(HashtagModel);
    }
}

const hashtagSchema = new Schema<IHashtagDocument>(
    {
        hashtag: { type: String, required: true },
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
hashtagSchema.loadClass(Hashtag);

const HashtagModel = model<IHashtagDocument>('Hashtag', hashtagSchema);

export { HashtagModel };

export default new Hashtag();
