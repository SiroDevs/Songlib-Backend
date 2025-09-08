import mongoose, { Schema, Document } from 'mongoose';

export interface IOrg extends Document {
    orgId: number;
    user: number;
    title: string;
    bio: string;
    public: boolean;
    created: Date;
    updated?: Date;
}

const orgSchema = new Schema<IOrg>({
    orgId: {
        type: Number,
        unique: true,
        index: true
    },
    user: {
        type: Number,
        index: true
    },
    title: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [100, 'title cannot exceed 50 characters']
    },
    bio: {
        type: String,
        trim: true,
    },
    public: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

export const Org = mongoose.model<IOrg>('Org', orgSchema);
export default Org;