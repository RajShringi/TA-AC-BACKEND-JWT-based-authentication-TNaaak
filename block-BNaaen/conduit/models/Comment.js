const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
commentSchema.methods.commentJSON = function (user = null) {
  return {
    id: this.id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    body: this.body,
    author: this.author.profileJSON(user),
  };
};
module.exports = mongoose.model("Comment", commentSchema);
