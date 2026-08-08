import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    userId: number;
    role: 'user' | 'admin';
    username: string;
    googleId: string;
    email: string;
    name: string;
    phone: string;
    photoUrl: string;
    bio: string;
    selectedBooks: string;
    lastseen: Date;
    created: Date;
    updated?: Date;
}

const userSchema = new Schema<IUser>({
    userId: {
        type: Number,
        unique: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        index: true
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [100, 'Username cannot exceed 50 characters']
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // avoid colliding on "missing" for non-Google logins
        trim: true,
        maxlength: [100, 'googleId cannot exceed 50 characters']
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        unique: true,
        sparse: true, // avoid colliding on "missing" when phone isn't set
        trim: true,
    },
    photoUrl: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    selectedBooks: {
        type: String,
        trim: true,
    },
    lastseen: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
