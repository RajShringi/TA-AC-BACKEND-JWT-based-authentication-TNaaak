const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
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
    const token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (err) {
    return err;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    name: this.name,
    email: this.email,
    token: token,
  };
};

module.exports = mongoose.model("User", userSchema);
