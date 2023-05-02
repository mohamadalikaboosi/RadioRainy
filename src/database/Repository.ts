import mongoose, { Document, Model, Types } from 'mongoose';

interface IPopulate {
    path: string;
    model: string;
    select?: [] | string;
    populate?: IPopulate;
}

interface IOption {
    select?: string;
    sort?: object;
    limit?: number;
    skip?: number;
    populate?: [IPopulate];
    lean?: boolean;
    session?: mongoose.mongo.ClientSession;
}

interface ISessionOption {
    session?: mongoose.mongo.ClientSession;
}

interface PaginationOptions {
    select?: string;
    sort?: object;
    limit: number;
    page: number;
    populate?: [IPopulate];
    lean?: boolean;
    session?: mongoose.mongo.ClientSession;
}

interface IRepository<T extends Document> {
    find(where: object, options: IOption): Promise<T[]>;

    count(where: object, options: IOption): Promise<number>;

    findOne(where: object, options: IOption): Promise<T>;

    findById(id: Types.ObjectId, options: IOption): Promise<T>;

    paginate(where: object, options: PaginationOptions): Promise<T>;

    update(where: object, update: Partial<T>, option: ISessionOption): Promise<T>;

    updateMany(where: object, update: Partial<T>, option: ISessionOption): Promise<T>;

    findByIdAndUpdate(id: Types.ObjectId, update: Partial<T>, option: ISessionOption): Promise<T>;

    findOneAndUpdate(where: object, update: Partial<T>, option: ISessionOption): Promise<T>;

    deleteMany(where: object, option: ISessionOption): Promise<T>;

    findByIdAndDelete(id: Types.ObjectId, option: ISessionOption): Promise<T>;

    findOneAndDelete(where: object, option: ISessionOption): Promise<T>;

    insert(value: Partial<T>): Promise<T>;

    insertMany(values: Partial<T>[], option: ISessionOption): Promise<T>;

    insertWithoutSave(value: Partial<T>, option: ISessionOption): Promise<T>;

    upsert(where: object, value: Partial<T>, session: mongoose.mongo.ClientSession | undefined): Promise<T | null>;
}

export default class Repository<T extends Document> implements IRepository<T> {
    private readonly model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    // Find
    async find(where: object, options: IOption = {}): Promise<any[]> {
        return this.model.find(where, {}, options).exec();
    }

    async count(where: object, options: IOption = {}): Promise<number> {
        return this.model.find(where, {}, options).count();
    }

    async findOne(where: object, options: IOption = {}): Promise<any> {
        return this.model.findOne(where, {}, options).exec();
    }

    async findById(id: Types.ObjectId, options: IOption = {}): Promise<any> {
        return this.model.findById(id, {}, options).exec();
    }

    async paginate(where: object = {}, options: PaginationOptions): Promise<any> {
        const { limit, page } = options;

        const skip = (page - 1) * limit;

        const results = await this.model.find(where, {}, { ...options, skip }).exec();

        const count = await this.model.countDocuments(where);

        const totalPages = Math.ceil(count / limit);

        return {
            results,
            count,
            totalPages,
            page,
            limit,
        };
    }

    // Update
    async update(where: object, update: Partial<T>, option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.updateOne(where, update, option);
        return this.model.updateOne(where, update);
    }

    async updateMany(where: object, update: Partial<T>, option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.updateMany(where, update, option);
        return this.model.updateMany(where, update);
    }

    async findByIdAndUpdate(
        id: Types.ObjectId,
        update: Partial<T>,
        option: ISessionOption | undefined = undefined,
    ): Promise<any> {
        if (option) return this.model.findByIdAndUpdate(id, update, option);
        return this.model.findByIdAndUpdate(id, update);
    }

    async findOneAndUpdate(
        where: object,
        update: Partial<T>,
        option: ISessionOption | undefined = undefined,
    ): Promise<any> {
        if (option) return this.model.findOneAndUpdate(where, update, option);
        return this.model.findOneAndUpdate(where, update);
    }

    // Delete
    async deleteMany(where: object, option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.deleteMany(where, option);
        return this.model.deleteMany(where);
    }

    async findByIdAndDelete(id: Types.ObjectId, option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.findByIdAndDelete(id, option);
        return this.model.findByIdAndDelete(id);
    }

    async findOneAndDelete(where: object, option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.findOneAndDelete(where, option);
        return this.model.findOneAndDelete(where);
    }

    // Insert
    async insert(value: Partial<T>): Promise<any> {
        return this.model.create(value);
    }

    async insertMany(values: Partial<T>[], option: ISessionOption | undefined = undefined): Promise<any> {
        if (option) return this.model.insertMany(values, option);
        return this.model.insertMany(values);
    }

    async insertWithoutSave(value: Partial<T>, option: ISessionOption | undefined = undefined): Promise<T> {
        if (option) return new this.model(value, option);
        return new this.model(value);
    }

    upsert(
        where: object,
        value: Partial<T>,
        session: mongoose.mongo.ClientSession | undefined = undefined,
    ): Promise<T | null> {
        if (session) {
            return this.model
                .findOneAndUpdate(where, value, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    session,
                })
                .exec();
        } else {
            return this.model
                .findOneAndUpdate(where, value, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                })
                .exec();
        }
    }
}
