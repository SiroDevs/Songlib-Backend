import { Router, Request, Response, NextFunction } from "express";

import Acounter from "./models/acounter";
import Song from "./models/song";

const router = Router();

/**
 * GET song list
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const songs = await Song.find({}).select("-_id").sort("songId");
    res.json({ count: songs.length, data: songs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * GET songs matching book numbers
 */
router.get("/book/:ids", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = req.params.ids.split(",");
    const songs = await Song.find({ book: { $in: ids } }).select("-_id").sort("songId");

    if (songs.length === 0) {
      return res.status(404).json({ message: "No songs found for the specified books" });
    }
    res.status(200).json({ count: songs.length, data: songs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * POST new song(s)
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.body)) {
      const songsToInsert = [];
      for (const song of req.body) {
        if (!song.title) continue;

        const counter = await Acounter.findOneAndUpdate(
          { _id: "songs" },
          { $inc: { seq: 1 } },
          { new: true }
        );
        song.songId = counter ? counter.seq : 1;
        songsToInsert.push(song);
      }

      const savedSongs = await Song.insertMany(songsToInsert);
      return res.json({ message: `${savedSongs.length} songs saved successfully`, data: savedSongs });
    }

    // Single song
    if (!req.body.title) {
      return res.status(400).json({ error: "An input field is either empty or invalid" });
    }

    const counter = await Acounter.findOneAndUpdate(
      { _id: "songs" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    req.body.songId = counter ? counter.seq : 1;
    const song = await Song.create(req.body);
    res.json(song);

  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Duplicate record found" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
});

/**
 * GET single song
 */
router.get("/:songId", async (req: Request, res: Response) => {
  try {
    const song = await Song.findOne({ songId: req.params.songId });
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.status(200).json(song);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * PUT song (update one)
 */
router.put("/:songId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Invalid input field(s)" });
    }

    const song = await Song.findOneAndUpdate({ songId: req.params.songId }, req.body, { new: true });
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    next(error);
  }
});

/**
 * PUT bulk update songs (e.g. shift songId by a value)
 */
router.put("/bulk/:value", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valueToAdd = parseInt(req.params.value, 10);

    const songs = await Song.find({ book: req.body.book }); // 🔹 pass book in body or adjust logic
    if (songs.length === 0) {
      return res.status(404).json({ message: "No songs found for the specified book" });
    }

    await Promise.all(
      songs.map((song) =>
        Song.findOneAndUpdate(
          { _id: song._id },
          { $set: { songId: song.songId + valueToAdd } },
          { new: true }
        )
      )
    );

    res.status(200).json({ message: `${songs.length} songs updated successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE single song
 */
router.delete("/:songId", async (req: Request, res: Response) => {
  try {
    const result = await Song.deleteOne({ songId: req.params.songId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE all songs from a book
 */
router.delete("/bulk/:book", async (req: Request, res: Response) => {
  try {
    const result = await Song.deleteMany({ book: req.params.book });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No songs found for the specified book" });
    }
    res.status(200).json({ message: `${result.deletedCount} songs deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
