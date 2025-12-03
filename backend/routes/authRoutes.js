const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Пример за защитен път
router.get("/me", authMiddleware, async (req, res) => {
  // Тук може да извикаш функция getMe от контролера
  const User = require("../models/User");
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

module.exports = router;
