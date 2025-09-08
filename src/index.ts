import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { home, users, books, songs, drafts, edits, listings, organisations } from "./routes";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./.env" });
}

const app = express();
app.use(cors());

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

mongoose
  .connect(process.env.ATLAS_URI as string, {
    authSource: "admin",
  })
  .then(() => console.log("MongoDB connected ..."))
  .catch((err) => console.error(err));

app.use(express.json({ limit: "50mb" }));

app.use("/", home);
app.use("/api", home);
app.use("/api/users", users);
app.use("/api/books", books);
app.use("/api/songs", songs);
app.use("/api/drafts", drafts);
app.use("/api/edits", edits);
app.use("/api/listings", listings);
app.use("/api/organisations", organisations);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`The SongLib Server is running on port ${PORT}`));
