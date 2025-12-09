const express = require("express");
const router = express.Router();

// ВАЖНО: Уверете се, че пътят до вашия модел е правилен!
// Ако папката routes е на същото ниво като models:
const Settings = require("../models/settingsSchema");

// Тук използваме router.get вместо app.get
// Използваме само "/", защото префиксът "/api/settings" ще бъде зададен в app.js
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
