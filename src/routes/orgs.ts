import { Router, Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import Acounter from "./models/acounter";
import Org from "./models/org";

const router = Router();

/**
 * GET org list
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Org.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * GET single org
 */
router.get("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await Org.findOne({ orgid: req.params.orgid });
    if (!org) {
      return res.status(404).json({ message: "Org not found" });
    }
    res.status(200).json(org);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * POST new org
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "An input field is either empty or invalid" });
  }

  try {
    const counter = await Acounter.findOne({ _id: "orgs" });
    if (!counter) return res.status(500).json({ error: "Counter not found" });

    req.body.orgid = counter.seq + 1;

    const data = await Org.create(req.body);
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
 * UPDATE org
 */
router.post("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "An input field is either empty or invalid" });
  }

  try {
    const myquery = { _id: new ObjectId(req.params.orgid) };
    const result = await Org.updateOne(myquery, req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE a org
 */
router.delete("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Org.deleteOne({ orgid: req.params.orgid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Org not found" });
    }

    res.status(200).json({ message: "Org deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
