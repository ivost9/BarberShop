const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "client" },
  isBlocked: { type: Boolean, default: false },
  noShowCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
