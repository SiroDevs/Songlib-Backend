import { Acounter, Book, IBook } from "../models";

export class BookService {
  /* Get all books */
  static async getAllBooks() {
    return await Book.find({}).select("-_id").sort("bookNo");
  }

  /**
   * Get single book by ID
   */
  static async getBookById(bookId: number) {
    return await Book.findOne({ bookId });
  }

  /**
   * Get multiple books by IDs
   */
  static async getBooksByIds(bookIds: number[]) {
    return await Book.find({ bookId: { $in: bookIds } });
  }

  /**
   * Create a single book
   */
  static async createSingleBook(bookData: any) {
    const counter = await Acounter.findOne({ _id: "books" });
    if (!counter) throw new Error("Counter not found");

    bookData.bookId = counter.seq + 1;
    const book = await Book.create(bookData);

    await Acounter.findOneAndUpdate(
      { _id: "books" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    return book;
  }

  /**
   * Create multiple books
   */
  static async createMultipleBooks(booksData: any[]) {
    const createdBooks = [];
    const errors = [];

    for (const [index, item] of booksData.entries()) {
      try {
        if (!item.title) {
          errors.push({ index, error: "Title is required" });
          continue;
        }

        const counter = await Acounter.findOne({ _id: "books" });
        if (!counter) throw new Error("Counter not found");

        item.bookId = counter.seq + 1;
        const newBook = await Book.create(item);
        createdBooks.push(newBook);

        await Acounter.findOneAndUpdate(
          { _id: "books" },
          { $inc: { seq: 1 } },
          { new: true }
        );
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

  /**
   * Update a single book
   */
  static async updateBook(bookId: number, updateData: any) {
    return await Book.findOneAndUpdate(
      { bookId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Update multiple books
   */
  static async updateMultipleBooks(booksData: any[]) {
    const updateResults = [];
    const errors = [];

    for (const [index, item] of booksData.entries()) {
      try {
        if (!item.bookId) {
          errors.push({ index, error: "bookId is required for update" });
          continue;
        }

        if (!item.title) {
          errors.push({ index, error: "Title is required" });
          continue;
        }

        const { bookId, ...updateData } = item;
        const book = await Book.findOneAndUpdate(
          { bookId },
          updateData,
          { new: true, runValidators: true }
        );

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

  /**
   * Delete a single book
   */
  static async deleteBook(bookId: number) {
    return await Book.deleteOne({ bookId });
  }

  /**
   * Delete multiple books
   */
  static async deleteMultipleBooks(bookIds: number[]) {
    const deleteResults = [];
    const errors = [];

    for (const [index, bookId] of bookIds.entries()) {
      try {
        const result = await Book.deleteOne({ bookId });
        
        if (result.deletedCount === 0) {
          errors.push({ index, bookId, error: "Book not found" });
          continue;
        }

        deleteResults.push({ bookId, deleted: true });
      } catch (error: any) {
        errors.push({ 
          index, 
          bookId,
          error: "Deletion failed",
          details: error.message
        });
      }
    }

    return { deleteResults, errors };
  }

  /**
   * Get next sequence value
   */
  static async getNextSequence() {
    const counter = await Acounter.findOne({ _id: "books" });
    if (!counter) throw new Error("Counter not found");
    return counter.seq + 1;
  }

  /**
   * Increment sequence
   */
  static async incrementSequence() {
    return await Acounter.findOneAndUpdate(
      { _id: "books" },
      { $inc: { seq: 1 } },
      { new: true }
    );
  }
}