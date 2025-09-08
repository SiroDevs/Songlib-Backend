import { Book } from "../models";
import { CounterService } from "./counterService";

export class BookService {
  static async getAllBooks() {
    return await Book.find({}).select("-_id").sort("bookNo");
  }

  static async getBooksByIds(bookIds: string[]) {
    return await Book.find({ bookId: { $in: bookIds } });
  }

  static async createSingleBook(bookData: any) {
    const nextBookId = await CounterService.getNextSequence("books");
    bookData.bookId = nextBookId;
    const book = await Book.create(bookData);
    await CounterService.incrementSequence("books");
    return book;
  }

  static async createMultipleBooks(booksData: any[]) {
    const createdBooks = [];
    const errors = [];

    for (const [index, item] of booksData.entries()) {
      try {
        if (!item.title) {
          errors.push({ index, error: "Title is required" });
          continue;
        }
        const newBook = await this.createSingleBook(item);
        createdBooks.push(newBook);
      } catch (error: any) {
        errors.push({
          index,
          error: error.code === 11000 ? "Duplicate record" : "Creation failed",
          details: error.message
        });
      }
    }

    return { createdBooks, errors };
  }

  static async updateBook(bookId: number, updateData: any) {
    return await Book.findOneAndUpdate(
      { bookId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  static async updateMultipleBooks(booksData: any[]) {
    const updateResults = [];
    const errors = [];

    for (const [index, item] of booksData.entries()) {
      try {
        if (!item.bookId || !item.title) {
          errors.push({ index, error: "books data is incomplete" });
          continue;
        }

        const { bookId, ...updateData } = item;
        const book = await this.updateBook(bookId, updateData);
        if (!book) {
          errors.push({ index, bookId, error: "Book not found" });
          continue;
        }
        updateResults.push(book);
      } catch (error: any) {
        errors.push({
          index,
          bookId: item.bookId,
          error: error.code === 11000 ? "Duplicate record" : "Update failed",
          details: error.message
        });
      }
    }
    return { updateResults, errors };
  }

  static async deleteBook(bookId: number) {
    return await Book.deleteOne({ bookId });
  }
}