const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    received_messages: [
      {
        sender_username: { type: String, required: true },
        message: { type: String },
        timestamp: { type: Date },
      },
    ],
    sent_messages: [
      {
        recipient_username: { type: String, required: true },
        message: { type: String },
        timestamp: { type: Date },
      },
    ],
  },
  { timestamps: true }
);
const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
