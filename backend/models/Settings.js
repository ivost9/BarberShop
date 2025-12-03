const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  acceptingNewClients: { type: Boolean, default: true },
});
module.exports = mongoose.model("Settings", settingsSchema);
