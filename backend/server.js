require("dotenv").config();
const express = require("express");
const cors = require("cors");

// 1. Импорт на конфигурацията за базата данни
const connectDB = require("./config/db");

// 2. Импорт на пътищата (Routes)
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// 3. Импорт на помощните скриптове
const cleanupOldAppointments = require("./utils/cronJobs");
const seedAdmin = require("./utils/seeder");

const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// --- MIDDLEWARE ---
const allowedOrigins = [
  "http://localhost:3000", // React (Create-React-App) локално
  "https://barber-shop-teal.vercel.app", // Твоят Vercel линк
  // Ако имаш друг линк, добави го тук
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Разрешаваме заявки без origin (напр. от Postman или мобилни приложения)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        // Ако сайтът не е в списъка
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// --- ROUTES MOUNTING ---
// Тук казваме на Express кой файл за кои URL-и отговаря

// За Auth (register, login, me) -> ще станат /api/register, /api/login
app.use("/api", authRoutes);

// За Appointments (book, list, cancel) -> ще станат /api/book, /api/appointments
app.use("/api", appointmentRoutes);

// За Admin -> ще станат /api/admin/all, /api/admin/users
app.use("/api/admin", adminRoutes);

// --- DB CONNECTION & SERVER START ---
connectDB()
  .then(async () => {
    // Тази част се изпълнява само след успешна връзка с базата

    // 1. Създаване на служебен админ (ако няма такъв)
    await seedAdmin();

    // 2. Първоначално почистване на стари часове
    await cleanupOldAppointments();

    // 3. Настройване на автоматично почистване (на всеки 1 час)
    // 3600000 ms = 1 час
    setInterval(cleanupOldAppointments, 3600000);

    // 4. Стартиране на сървъра
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend allowed from: ${FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Database. Server shutting down.");
    process.exit(1); // Спира процеса, ако няма база данни
  });
