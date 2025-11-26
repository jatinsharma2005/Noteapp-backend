import express from "express";
import auth from "../middleware/auth.js";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePin, // ✅ IMPORTED
} from "../controllers/notesController.js";

const router = express.Router();

// ---------------------------
// PROTECTED NOTE ROUTES
// ---------------------------

// Get all notes
router.get("/", auth, getNotes);

// Create note
router.post("/", auth, createNote);

// Update note
router.put("/:id", auth, updateNote);

// ⭐ Pin / Unpin note (MUST be above delete route)
router.put("/pin/:id", auth, togglePin);

// Delete note
router.delete("/:id", auth, deleteNote);

export default router;
