import mongoose, { Schema, Document } from 'mongoose';

export interface IDraft extends Document {
    draftId: number;
    book: number;
    songNo: number;
    title: string;
    alias: string;
    content: string;
    key: string;
    author: string;
    views: number;
    likes: number;
    liked: boolean;
    created: Date;
    updated?: Date;
}

const draftSchema = new Schema<IDraft>({
    draftId: {
        type: Number,
        unique: true,
        index: true
    },
    book: {
        type: Number,
        default: 0
    },
    songNo: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    alias: {
        type: String,
        maxlength: [100, 'Alias cannot exceed 100 characters']
    },
    content: {
        type: String,
        trim: true,
    },
    key: {
        type: String,
        trim: true,
    },
    author: {
        type: String,
        trim: true,
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    liked: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

export const Draft = mongoose.model<IDraft>('Draft', draftSchema);
export default Draft;