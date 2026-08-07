import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  bookId: number;
  user: number;
  icon?: string;
  title: string;
  subTitle: string;
  songs: number;
  position: number;
  bookNo: number;
  enabled: boolean;
  created: Date;
  updated?: Date;
}

const bookSchema = new Schema<IBook>({
  bookId: {
    type: Number,
    unique: true,
    index: true
  },
  user: {
    type: Number,
    default: 1
  },
  icon: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subTitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Subtitle cannot exceed 100 characters']
  },
  songs: {
    type: Number,
    default: 0,
    min: [0, 'Songs count cannot be negative']
  },
  position: {
    type: Number,
    default: 0,
    min: [0, 'Position cannot be negative']
  },
  bookNo: {
    type: Number,
    default: 0,
    min: [0, 'Book number cannot be negative']
  },
  enabled: {
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

bookSchema.pre<IBook>('save', function(next) {
  this.updated = new Date();
  next();
});

export const Book = mongoose.model<IBook>('Book', bookSchema);
export default Book;