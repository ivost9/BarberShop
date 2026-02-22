const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Маха интервалите в началото и края
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    // Тук не слагаме minlength, защото паролата ще се записва ХЕШИРАНА (дълъг низ)
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, default: "client" },
  isBlocked: { type: Boolean, default: false },
  noShowCount: { type: Number, default: 0 },
});
module.exports = mongoose.model("User", userSchema);
