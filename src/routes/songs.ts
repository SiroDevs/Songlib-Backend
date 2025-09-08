import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { Acounter, Song } from "../models";

const router = Router();
const { ObjectId } = mongoose.Types;

/**
 * GET song list.
 *
 * @return song list | empty.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Song.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * GET single song.
 *
 * @return song details | empty.
 */
router.get("/:songid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findOne({ songid: req.params.songid });
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.status(200).json(song);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * POST new song.
 *
 * @return song details | error.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        error: "An input field is either empty or invalid",
      });
    }

    const counter = await Acounter.findOne({ _id: "orgs" });
    if (!counter) {
      return res.status(500).json({ error: "Counter not found" });
    }

    req.body.songid = counter.seq + 1;

    const newOrg = await Song.create(req.body);

    await Acounter.findOneAndUpdate(
      { _id: "orgs" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    res.json(newOrg);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Duplicate record found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
});

/**
 * UPDATE song.
 *
 * @return updated song | error.
 */
router.put("/:songid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        error: "An input field is either empty or invalid",
      });
    }

    const updated = await Song.updateOne(
      { _id: new ObjectId(req.params.songid) },
      req.body
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ message: "Song updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * DELETE a song.
 *
 * @return delete result | error.
 */
router.delete("/:songid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Song.deleteOne({ songid: req.params.songid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

export default router;
