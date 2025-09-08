import { Song } from "../models";
import { CounterService } from "./counterService";

export class SongService {
  static async getSongById(songId: number) {
    return await Song.findOne({ songId });
  }

  static async getSongsByIds(songIds: number[]) {
    return await Song.find({ songId: { $in: songIds } });
  }

  static async getSongsByBookIds(bookIds: string[]) {
    return await Song.find({ book: { $in: bookIds } }).select("-_id").sort("songId");
  }

  /**
   * Get songs by book number
   */
  static async getSongsByBook(book: string) {
    return await Song.find({ book }).select("-_id").sort("songId");
  }

  /**
   * Create a single song with auto-incremented ID
   */
  static async createSingleSong(songData: any) {
    const nextSongId = await CounterService.getNextSequence("songs");
    songData.songId = nextSongId;
    
    const song = await Song.create(songData);
    await CounterService.incrementSequence("songs");
    
    return song;
  }

  /**
   * Create multiple songs with auto-incremented IDs
   */
  static async createMultipleSongs(songsData: any[]) {
    const createdSongs = [];
    const errors = [];

    for (const [index, item] of songsData.entries()) {
      try {
        if (!item.title) {
          errors.push({ index, error: "Title is required" });
          continue;
        }

        const song = await this.createSingleSong(item);
        createdSongs.push(song);
      } catch (error: any) {
        errors.push({ 
          index, 
          error: error.code === 11000 ? "Duplicate record" : "Creation failed",
          details: error.message
        });
      }
    }

    return { createdSongs, errors };
  }

  /**
   * Update a single song
   */
  static async updateSong(songId: number, updateData: any) {
    return await Song.findOneAndUpdate(
      { songId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Update multiple songs
   */
  static async updateMultipleSongs(songsData: any[]) {
    const updateResults = [];
    const errors = [];

    for (const [index, item] of songsData.entries()) {
      try {
        if (!item.songId) {
          errors.push({ index, error: "songId is required for update" });
          continue;
        }

        if (!item.title) {
          errors.push({ index, error: "Title is required" });
          continue;
        }

        const { songId, ...updateData } = item;
        const song = await this.updateSong(songId, updateData);

        if (!song) {
          errors.push({ index, songId, error: "Song not found" });
          continue;
        }

        updateResults.push(song);
      } catch (error: any) {
        errors.push({ 
          index, 
          songId: item.songId,
          error: error.code === 11000 ? "Duplicate record" : "Update failed",
          details: error.message
        });
      }
    }

    return { updateResults, errors };
  }

  /**
   * Bulk update songs by adding value to songId
   */
  static async bulkUpdateSongIds(book: string, valueToAdd: number) {
    const songs = await Song.find({ book });
    
    if (songs.length === 0) {
      return { updatedCount: 0, songs: [] };
    }

    const updatePromises = songs.map(async (song) => {
      return await Song.findOneAndUpdate(
        { _id: song._id },
        { $set: { songId: song.songId + valueToAdd } },
        { new: true }
      );
    });

    const updatedSongs = await Promise.all(updatePromises);
    return { updatedCount: updatedSongs.length, songs: updatedSongs };
  }

  /**
   * Delete a single song
   */
  static async deleteSong(songId: number) {
    return await Song.deleteOne({ songId });
  }

  /**
   * Delete multiple songs by IDs
   */
  static async deleteMultipleSongs(songIds: number[]) {
    const deleteResults = [];
    const errors = [];

    for (const [index, songId] of songIds.entries()) {
      try {
        const result = await this.deleteSong(songId);
        
        if (result.deletedCount === 0) {
          errors.push({ index, songId, error: "Song not found" });
          continue;
        }

        deleteResults.push({ songId, deleted: true });
      } catch (error: any) {
        errors.push({ 
          index, 
          songId,
          error: "Deletion failed",
          details: error.message
        });
      }
    }

    return { deleteResults, errors };
  }

  /**
   * Delete all songs from a book
   */
  static async deleteSongsByBook(book: string) {
    const result = await Song.deleteMany({ book });
    return result.deletedCount;
  }
}