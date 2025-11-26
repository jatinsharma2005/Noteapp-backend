import Note from "../models/Note.js";

// -------------------------------------
// GET ALL NOTES (Pinned first → Latest first)
// -------------------------------------
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      pinned: -1,
      updatedAt: -1,
    });

    return res.json({ success: true, notes });
  } catch (err) {
    console.error("Get Notes Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------------------
// CREATE NOTE
// -------------------------------------
export const createNote = async (req, res) => {
  try {
    const { title, content, tags, pinned } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });

    const newNote = await Note.create({
      title,
      content,
      user: req.user.id,
      pinned: pinned || false,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: newNote,
    });
  } catch (err) {
    console.error("Create Note Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------------------
// UPDATE NOTE
// -------------------------------------
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    if (note.user.toString() !== req.user.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // Update fields only if they are provided
    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.tags !== undefined) note.tags = req.body.tags;

    const updatedNote = await note.save();

    return res.json({ success: true, note: updatedNote });
  } catch (err) {
    console.error("Update Note Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------------------
// TOGGLE PIN
// -------------------------------------
export const togglePin = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    if (note.user.toString() !== req.user.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    note.pinned = !note.pinned;
    await note.save();

    return res.json({
      success: true,
      message: note.pinned ? "Note pinned" : "Note unpinned",
      note,
    });
  } catch (err) {
    console.error("Pin Note Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------------------
// DELETE NOTE
// -------------------------------------
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    if (note.user.toString() !== req.user.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    await note.deleteOne();

    return res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (err) {
    console.error("Delete Note Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
