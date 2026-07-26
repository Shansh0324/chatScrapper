import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Study Notes",
    },
    author: {
      type: String,
      default: "",
    },
    markdown: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
