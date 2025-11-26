// models/Note.js
import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    // ⭐ NEW FIELD: Pin notes (pinned notes appear first)
    pinned: {
      type: Boolean,
      default: false,
    },

    // ⭐ NEW FIELD: Tags/categories for notes
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
