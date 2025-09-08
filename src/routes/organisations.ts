import { Router, Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import { Acounter, Organisation } from "../models";

const router = Router();

/**
 * GET organisation list
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Organisation.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * GET single organisation
 */
router.get("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organisation = await Organisation.findOne({ orgid: req.params.orgid });
    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }
    res.status(200).json(organisation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * POST new organisation
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "An input field is either empty or invalid" });
  }

  try {
    const counter = await Acounter.findOne({ _id: "orgs" });
    if (!counter) return res.status(500).json({ error: "Counter not found" });

    req.body.orgid = counter.seq + 1;

    const data = await Organisation.create(req.body);
    await Acounter.findOneAndUpdate({ _id: "orgs" }, { $inc: { seq: 1 } });

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
 * UPDATE organisation
 */
router.post("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "An input field is either empty or invalid" });
  }

  try {
    const myquery = { _id: new ObjectId(req.params.orgid) };
    const result = await Organisation.updateOne(myquery, req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE a organisation
 */
router.delete("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Organisation.deleteOne({ orgid: req.params.orgid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    res.status(200).json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
