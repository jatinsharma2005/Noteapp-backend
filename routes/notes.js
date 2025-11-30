// routes/notes.js
import express from "express";
import Note from "../models/Note.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth); // all routes require token

// CREATE NOTE
router.post("/", async (req, res) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      pinned: false,
      user: req.user.id,
    });
    res.json({ success: true, note });
  } catch (err) {
    console.error("Create Note Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET NOTES
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      pinned: -1,
      createdAt: -1,
    });
    res.json({ success: true, notes });
  } catch (err) {
    console.error("Get Notes Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// You can add update, delete, pin similarly...

export default router;
