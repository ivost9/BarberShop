// src/config/db.js
const mongoose = require("mongoose");
const Settings = require("../models/settingsSchema"); // Внимавай с пътя

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/barber_shop"
    );

    // Инициализация на настройките при успешна връзка
    const s = await Settings.findOne();
    if (!s) await Settings.create({});

    console.log(`✅ DB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ DB Connection Error: ${err.message}`);
    process.exit(1); // Спира процеса при грешка
  }
};

module.exports = connectDB;
