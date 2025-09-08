export class ValidationUtils {
  static parseIds(ids: string): number[] {
    return ids.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  }

  static isValidBookId(bookId: any): bookId is number {
    return !isNaN(parseInt(bookId)) && parseInt(bookId) > 0;
  }

  static validateBookData(bookData: any): string | null {
    if (!bookData.title) return "Title is required";
    if (!bookData.subTitle) return "Subtitle is required";
    return null;
  }

  static parseSongIds(ids: string): number[] {
    return ids.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  }

  static parseBookIds(ids: string): string[] {
    return ids.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }

  static validateSongData(songData: any): string | null {
    if (!songData.title) return "Title is required";
    return null;
  }

  static isBulkOperation(data: any): data is any[] {
    return Array.isArray(data);
  }
}