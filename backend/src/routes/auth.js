const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Уверете се, че пътищата до моделите са верни спрямо папката routes
const User = require("../models/userSchema");
const Settings = require("../models/settingsSchema"); // или както се казва файла с модела

// Дефинирайте вашата тайна фраза (най-добре в .env файл)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// 1. REGISTER
// Пътят тук е само "/register", защото "/api" ще дойде от app.js
router.post("/register", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings && !settings.acceptingNewClients) {
      return res
        .status(403)
        .json({ error: "За съжаление, в момента не приемаме нови клиенти." });
    }

    const { username, password, firstName, lastName, phone } = req.body;

    // Валидация
    if (!username || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ error: "Моля попълнете всички полета." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });

    res.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: "Username already exists or error occurred" });
  }
});

// 2. LOGIN
// Пътят тук е само "/login"
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ error: "Вашият профил е блокиран поради неявяване." });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    // Създаване на токен
    const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET);

    res.json({
      token,
      role: user.role,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
