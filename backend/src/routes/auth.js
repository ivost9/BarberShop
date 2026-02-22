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
    // 1. Проверка дали се приемат нови клиенти
    const settings = await Settings.findOne();
    if (settings && !settings.acceptingNewClients) {
      return res
        .status(403)
        .json({ error: "За съжаление, в момента не приемаме нови клиенти." });
    }

    const { username, password, firstName, lastName, phone } = req.body;

    // --- СТРОГА ВАЛИДАЦИЯ (Идентична с фронтенда) ---

    // 2. Проверка за празни полета
    if (
      !username?.trim() ||
      !password?.trim() ||
      !firstName?.trim() ||
      !lastName?.trim() ||
      !phone?.trim()
    ) {
      return res
        .status(400)
        .json({ error: "Моля, попълнете абсолютно всички полета." });
    }

    // 3. Потребителско име (мин 3 символа)
    if (username.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Потребителското име трябва да е поне 3 символа." });
    }

    // 4. Парола (8-30 символа)
    if (password.length < 8 || password.length > 30) {
      return res
        .status(400)
        .json({ error: "Паролата трябва да бъде между 8 и 30 символа." });
    }

    // 5. Имена (Само букви и дължина 3-30)
    const nameRegex = /^[A-Za-zА-Яа-я]+$/;
    if (
      firstName.length < 3 ||
      firstName.length > 30 ||
      !nameRegex.test(firstName)
    ) {
      return res
        .status(400)
        .json({ error: "Името трябва да съдържа само букви (3-30 символа)." });
    }
    if (
      lastName.length < 3 ||
      lastName.length > 30 ||
      !nameRegex.test(lastName)
    ) {
      return res.status(400).json({
        error: "Фамилията трябва да съдържа само букви (3-30 символа).",
      });
    }

    // 6. Телефон (Български формат 08...)
    const phoneRegex = /^08\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Невалиден телефонен номер. Трябва да е във формат 08XXXXXXXX.",
      });
    }

    // --- КРАЙ НА ВАЛИДАЦИИТЕ ---

    // 7. Проверка дали потребителят вече съществува
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Потребителското име вече е заето." });
    }

    // 8. Хеширане и запис
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username: username.trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });

    res.json({ message: "Регистрацията е успешна!" });
  } catch (err) {
    console.error("Грешка при регистрация:", err);
    res
      .status(500)
      .json({ error: "Възникна вътрешна грешка при регистрацията." });
  }
});

// 2. LOGIN
// Пътят тук е само "/login"

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Търсим потребителя
    const user = await User.findOne({ username });

    // Ако потребителят не съществува, НЕ КАЗВАМЕ "User not found".
    // Преминаваме към обща проверка за грешка по-долу.

    let isMatch = false;
    if (user) {
      // 2. Проверяваме паролата само ако потребителят е намерен
      isMatch = await bcrypt.compare(password, user.password);
    }

    // --- ОБЩА ПРОВЕРКА ЗА ГРЕШНИ ДАННИ ---
    // Обединяваме "няма такъв потребител" и "грешна парола" в едно
    if (!user || !isMatch) {
      return res
        .status(401)
        .json({ error: "Невалидно потребителско име или парола" });
    }

    // 3. Проверка за блокиран профил (това е добре да остане специфично)
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ error: "Вашият профил е блокиран поради неявяване." });
    }

    // 4. Създаване на токен (остава същото)
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }, // Добра практика е да има давност
    );

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
    res
      .status(500)
      .json({ error: "Възникна системна грешка. Моля, опитайте по-късно." });
  }
});

module.exports = router;
