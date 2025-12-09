const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  clientName: String,
  date: Date,
  status: { type: String, default: "active" },
  serviceType: { type: String, default: "hair" },
  duration: { type: Number, default: 30 },
});
module.exports = mongoose.model("Appointment", appointmentSchema);
