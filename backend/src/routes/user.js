const express = require("express");
const router = express.Router();
// Импортирайте моделите и auth, както са при вас
const User = require("../models/userSchema");
const auth = require("../middleware/auth");

// Оригинален път: /api/me
// Тук пишем само "/me", защото в app.js ще зададем префикс "/api"
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

module.exports = router;
