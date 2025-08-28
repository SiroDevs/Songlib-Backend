import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import { home, book, books, drafts, edits, listings, orgs, song, songs, users } from "./routes";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./.env" });
}

// Load Swagger docs
const swaggerDoc = JSON.parse(
  fs.readFileSync(path.join(__dirname, "api", "docs.json"), "utf8")
);
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Initialize app
const app = express();
app.use(cors());

// Custom CORS headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.ATLAS_URI as string, {
    authSource: "admin",
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error(err));

// Middleware
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/", home);
app.use("/api", home);
app.use("/api/book", book);
app.use("/api/books", books);
app.use("/api/drafts", drafts);
app.use("/api/edits", edits);
app.use("/api/listings", listings);
app.use("/api/orgs", orgs);
app.use("/api/song", song);
app.use("/api/songs", songs);
app.use("/api/users", users);

// Swagger docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    customCss:
      ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
    customCssUrl: CSS_URL,
  })
);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Songlib Server is running on port ${PORT}`));
