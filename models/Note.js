// models/Note.js
import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🔥 Faster queries: Note.find({ user })
    },

    title: {
      type: String,
      required: true,
      trim: true, // 🔥 Remove trailing spaces
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true, // 🔥 Sorting pinned notes becomes faster
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Important for Next.js hot reload:
// Prevent CompilationError: Cannot overwrite `Note` model
export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
