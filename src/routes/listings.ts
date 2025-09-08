import express, { Request, Response, NextFunction } from "express";

import { Acounter, Listing } from "../models";

const router = express.Router();

/**
 * GET listing list.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Listing.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * GET single listing.
 */
router.get("/:listingid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await Listing.findOne({ listingid: req.params.listingid });
    if (!listing) {
      return res.status(404).json({ message: "List not found" });
    }
    res.status(200).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * POST new listing.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.title) {
    return res
      .status(400)
      .json({ error: "An input field is either empty or invalid" });
  }

  try {
    const counter = await Acounter.findOne({ _id: "listings" });
    if (!counter) {
      return res.status(500).json({ error: "Counter not found" });
    }

    req.body.listingid = counter.seq + 1;

    const data = await Listing.create(req.body);

    await Acounter.findOneAndUpdate(
      { _id: "listings" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    res.json(data);
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
 * PUT edit listing.
 */
router.put("/:listingid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const update = req.body;
    const data = await Listing.findOneAndUpdate(
      { _id: req.params.listingid },
      update,
      { new: true }
    );

    res.json({
      status: 200,
      data: data,
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE a listing.
 */
router.delete("/:listingid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await Listing.deleteOne({ listingid: req.params.listingid });

    if (listing.deletedCount === 0) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
