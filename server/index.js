import express from "express";
import cors from "cors";
import { createRequestHandler } from "@react-router/express";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const announcementSchema = new mongoose.Schema({
  announcement: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model("Announcement", announcementSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

app.get("/api/health", async (_req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/announcements", async (_req, res) => {
  try {
    await connectToDatabase();
    const records = await Announcement.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    await connectToDatabase();
    const text = req.body?.announcement?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: "Announcement text cannot be empty." });
    }
    const record = await Announcement.create({ announcement: text });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));

try {
  const build = await import("../build/server/index.js");
  app.use(createRequestHandler({ build, mode: process.env.NODE_ENV }));
  console.log("React Router handler attached");
} catch {
  console.warn("React Router build not found — Express API routes only. Run 'npm run build' for full production.");
}

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
