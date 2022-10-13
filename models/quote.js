const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const quoteSchema = new Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  creatorName: { type: String, required: true },
});

module.exports = mongoose.model("Quote", quoteSchema);
