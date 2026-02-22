require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const webpush = require("web-push");

// 1. Конфигурации и База данни

const connectDB = require("./src/config/db");

const corsOptions = require("./src/config/corsOptions");

// 2. Модели

const Appointment = require("./src/models/appointmentSchema");

const Waitlist = require("./src/models/waitlistSchema");

// 3. Помощни скриптове (Админ и Автоматични задачи)

const seedAdmin = require("./src/utils/seedAdmin");

const startCronJobs = require("./src/utils/cronJobs");

// 4. Middleware

const authMiddleware = require("./src/middleware/auth");

const app = express();

// --- ⚙️ MIDDLEWARE ---

app.use(express.json());

app.use(cors(corsOptions));

// --- ⚙️ VAPID CONFIG (Push Notifications) ---

if (process.env.PUBLIC_VAPID_KEY && process.env.PRIVATE_VAPID_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@barbershop.bg",

    process.env.PUBLIC_VAPID_KEY,

    process.env.PRIVATE_VAPID_KEY
  );

  console.log("✅ VAPID ключовете са заредени успешно.");
}

// --- 🛡️ СПЕЦИАЛЕН МАРШРУТ: ОТМЯНА И ИЗВЕСТЯВАНЕ ---

app.post("/api/cancel", authMiddleware, async (req, res) => {
  console.log("🚀 Сигнал за отмяна на час. ID:", req.body.id);

  try {
    const appointment = await Appointment.findById(req.body.id);

    if (!appointment) {
      return res.status(404).json({ error: "Не е намерен такъв час." });
    }

    const slotDate = appointment.date;

    await Appointment.findByIdAndDelete(req.body.id);

    console.log("🗑️ Изтрит час за дата:", slotDate);

    const startRange = new Date(slotDate);

    startRange.setMinutes(startRange.getMinutes() - 1);

    const endRange = new Date(slotDate);

    endRange.setMinutes(endRange.getMinutes() + 1);

    const luckyUser = await Waitlist.findOne({
      date: { $gte: startRange, $lte: endRange },
    }).sort({ createdAt: 1 });

    if (luckyUser && luckyUser.subscription) {
      const timeString = new Date(slotDate).toLocaleTimeString("bg-BG", {
        hour: "2-digit",

        minute: "2-digit",
      });

      const payload = JSON.stringify({
        title: "Свободен час! ✂️",

        body: `Часът за ${timeString} се освободи! Резервирай го веднага, преди някой друг да те изпревари.`,

        icon: "/logo192.png",

        badge: "/logo192.png",

        data: { url: "/dashboard" },
      });

      webpush

        .sendNotification(luckyUser.subscription, payload)

        .then(() =>
          console.log(`📲 Известие изпратено до ${luckyUser.username}`)
        )

        .catch((err) => console.error("📲 Push error:", err));

      await Waitlist.findByIdAndDelete(luckyUser._id);
    }

    res.json({ success: true, message: "OK" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 🛣️ ROUTES (МАРШРУТИ) ---

app.use("/api/settings", require("./src/routes/settings")); // Фиксира 404 грешката

app.use("/api/waitlist", require("./src/routes/waitlist"));

app.use("/api/admin", require("./src/routes/admin"));

app.use("/api", require("./src/routes/auth"));

app.use("/api", require("./src/routes/user"));

app.use("/api", require("./src/routes/appointments"));

// --- 🚀 СТАРТИРАНЕ ЧРЕЗ ASYNC ФУНКЦИЯ ---

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Свързване с БД

    await connectDB();

    console.log("📡 Базата данни е свързана.");

    // 2. Изпълнение на начални скриптове

    await seedAdmin(); // Създава админ профил, ако няма такъв

    startCronJobs(); // Стартира автоматичното чистене на стари часове

    console.log("⚙️ Системните скриптове са стартирани.");

    // 3. Пускане на сървъра

    app.listen(PORT, () => {
      console.log(`🚀 Сървърът работи на порт ${PORT}. Агентът е буден.`);
    });
  } catch (error) {
    console.error("❌ Грешка при стартиране на сървъра:", error);
  }
};

startServer();
