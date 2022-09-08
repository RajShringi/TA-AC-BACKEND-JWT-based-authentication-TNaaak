const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  bio: { type: String },
  image: { type: String },
  followings: [{ type: Schema.Types.ObjectId, ref: "User" }],
  favorites: [{ type: Schema.Types.ObjectId, ref: "Article" }],
});

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (err) {
    return err;
  }
};

userSchema.methods.signToken = async function () {
  const payload = { userId: this.id, email: this.email };
  try {
    const token = jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (err) {
    return err;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
    bio: this.bio,
    image: this.image,
  };
};

userSchema.methods.profileJSON = function (user = null) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image,
    followings: user ? user.followings.includes(this.id) : false,
  };
};

module.exports = mongoose.model("User", userSchema);
