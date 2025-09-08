import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    listingId: number;
    parentId: number;
    title: string;
    song: number;
    created: Date;
    updated?: Date;
}

const listingSchema = new Schema<IListing>({
    listingId: {
        type: Number,
        unique: true
    },
    parentId: {
        type: Number,
    },
    title: {
        type: String,
        required: false
    },
    song: {
        type: Number,
        required: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
export default Listing;