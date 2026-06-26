import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  announcement: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let model;

export function getAnnouncementModel() {
  if (!model) {
    model = mongoose.model("Announcement", announcementSchema);
  }
  return model;
}
