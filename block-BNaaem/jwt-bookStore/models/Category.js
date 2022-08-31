const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true },
  books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
});

module.exports = mongoose.model("Category", categorySchema);
