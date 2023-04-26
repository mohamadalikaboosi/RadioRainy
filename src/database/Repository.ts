import { Document, Model, Types } from 'mongoose';

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
}

interface PaginationOptions {
    select?: string;
    sort?: object;
    limit: number;
    page: number;
    populate?: [IPopulate];
    lean?: boolean;
}

interface IRepository<T extends Document> {
    find(where: object, options: IOption): Promise<T[]>;

    findOne(where: object, options: IOption): Promise<T>;

    findById(id: Types.ObjectId, options: IOption): Promise<T>;

    paginate(where: object, options: PaginationOptions): Promise<T>;

    update(where: object, update: Partial<T>): Promise<T>;

    updateMany(where: object, update: Partial<T>): Promise<T>;

    findByIdAndUpdate(id: Types.ObjectId, update: Partial<T>): Promise<T>;

    findOneAndUpdate(where: object, update: Partial<T>): Promise<T>;

    deleteMany(where: object): Promise<T>;

    findByIdAndDelete(id: Types.ObjectId): Promise<T>;

    findOneAndDelete(where: object): Promise<T>;

    insert(value: Partial<T>): Promise<T>;

    insertMany(values: Partial<T>[]): Promise<T>;

    insertWithoutSave(value: Partial<T>): Promise<T>;
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
    async update(where: object, update: Partial<T>): Promise<any> {
        return this.model.updateOne(where, update);
    }

    async updateMany(where: object, update: Partial<T>): Promise<any> {
        return this.model.updateMany(where, update);
    }

    async findByIdAndUpdate(id: Types.ObjectId, update: Partial<T>): Promise<any> {
        return this.model.findByIdAndUpdate(id, update);
    }

    async findOneAndUpdate(where: object, update: Partial<T>): Promise<any> {
        return this.model.findOneAndUpdate(where, update);
    }

    // Delete
    async deleteMany(where: object): Promise<any> {
        return this.model.deleteMany(where);
    }

    async findByIdAndDelete(id: Types.ObjectId): Promise<any> {
        return this.model.findByIdAndDelete(id);
    }

    async findOneAndDelete(where: object): Promise<any> {
        return this.model.findOneAndDelete(where);
    }

    // Insert
    async insert(value: Partial<T>): Promise<any> {
        return this.model.create(value);
    }

    async insertMany(values: Partial<T>[]): Promise<any> {
        return this.model.insertMany(values);
    }

    async insertWithoutSave(value: Partial<T>): Promise<T> {
        return new this.model(value);
    }
}
