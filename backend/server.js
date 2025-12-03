require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// --- КОНФИГУРАЦИЯ ---
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/barber_shop";
const JWT_SECRET = process.env.JWT_SECRET || "secret_diploma_key_123";

// --- ВАЖНО: СПИСЪК С РАЗРЕШЕНИ САЙТОВЕ (CORS) ---
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

// --- DATABASE MODELS ---

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "client" },
  isBlocked: { type: Boolean, default: false },
  noShowCount: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  clientName: String,
  date: Date,
  status: { type: String, default: "active" },
  serviceType: { type: String, default: "hair" },
  duration: { type: Number, default: 30 },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);

const settingsSchema = new mongoose.Schema({
  acceptingNewClients: { type: Boolean, default: true },
});
const Settings = mongoose.model("Settings", settingsSchema);

// --- MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// --- ROUTES ---

// 0. GET SETTINGS
app.get("/api/settings", async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

// 1. REGISTER
app.post("/api/register", async (req, res) => {
  const settings = await Settings.findOne();
  if (settings && !settings.acceptingNewClients) {
    return res
      .status(403)
      .json({ error: "За съжаление, в момента не приемаме нови клиенти." });
  }

  const { username, password, firstName, lastName, phone } = req.body;

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: "Моля попълнете всички полета." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

// 2. LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  if (user.isBlocked)
    return res
      .status(403)
      .json({ error: "Вашият профил е блокиран поради неявяване." });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET);
  res.json({
    token,
    role: user.role,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
});

// 3. GET USER PROFILE
app.get("/api/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

// 4. GET APPOINTMENTS
app.get("/api/appointments", async (req, res) => {
  const appointments = await Appointment.find({ status: "active" });
  res.json(appointments);
});

// 5. BOOK APPOINTMENT
app.post("/api/book", auth, async (req, res) => {
  const { date, serviceType } = req.body;

  const duration = serviceType === "full" ? 60 : 30;
  const requestedStart = new Date(date);
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

  const existing = await Appointment.findOne({
    userId: req.user._id,
    status: "active",
    date: { $gt: new Date() },
  });

  if (existing) {
    return res.status(400).json({
      error:
        "Имате предстоящ час. Не може да пазите втори преди да мине първият.",
    });
  }

  const startOfDay = new Date(requestedStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedStart);
  endOfDay.setHours(23, 59, 59, 999);

  const dayAppointments = await Appointment.find({
    status: "active",
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const hasConflict = dayAppointments.some((app) => {
    const appStart = new Date(app.date);
    const appDuration = app.duration || 30;
    const appEnd = new Date(appStart.getTime() + appDuration * 60000);
    return appStart < requestedEnd && appEnd > requestedStart;
  });

  if (hasConflict) {
    return res.status(400).json({ error: "Този час вече е зает." });
  }

  const user = await User.findById(req.user._id);

  await Appointment.create({
    userId: user._id,
    username: user.username,
    clientName: `${user.firstName} ${user.lastName}`,
    date: date,
    serviceType: serviceType || "hair",
    duration: duration,
  });

  res.json({ message: "Success" });
});

// 6. CANCEL APPOINTMENT
app.post("/api/cancel", auth, async (req, res) => {
  const { id } = req.body;
  const appointment = await Appointment.findById(id);

  if (!appointment) return res.status(404).json({ error: "Not found" });

  if (req.user.role !== "admin") {
    const appointmentTime = new Date(appointment.date).getTime();
    const currentTime = new Date().getTime();
    const hoursDiff = (appointmentTime - currentTime) / (1000 * 60 * 60);

    if (hoursDiff < 12) {
      return res.status(400).json({
        error: "Твърде късно е за отказ онлайн. Моля свържете се с нас.",
      });
    }
  }

  await Appointment.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
});

// 7. ADMIN ACTIONS - GET ALL APPOINTMENTS
app.get("/api/admin/all", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");
  const apps = await Appointment.find({ status: { $ne: "cancelled" } }).sort({
    date: -1,
  });
  res.json(apps);
});

// 8. ADMIN ACTIONS - GET ALL USERS
app.get("/api/admin/users", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-password")
    .sort({ firstName: 1 });
  res.json(users);
});

// 9. ADMIN ACTIONS - MARK NO SHOW
app.post("/api/admin/noshow", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");
  const { id } = req.body;

  const app = await Appointment.findById(id);
  if (app) {
    app.status = "noshow";
    await app.save();

    const user = await User.findById(app.userId);
    if (user) {
      user.noShowCount += 1;
      if (user.noShowCount >= 2) {
        user.isBlocked = true;
      }
      await user.save();
    }
  }

  res.json({ message: "Marked as No-Show" });
});

// 10. ADMIN ACTIONS - TOGGLE REGISTRATION
app.post("/api/admin/toggle-registration", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");

  const settings = await Settings.findOne();
  settings.acceptingNewClients = !settings.acceptingNewClients;
  await settings.save();

  res.json({
    message: "Settings updated",
    acceptingNewClients: settings.acceptingNewClients,
  });
});

// --- АВТОМАТИЧНО ПОЧИСТВАНЕ ---
const cleanupOldAppointments = async () => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await Appointment.deleteMany({ date: { $lt: cutoffDate } });

    const deletedCancelled = await Appointment.deleteMany({
      status: "cancelled",
    });
    if (deletedCancelled.deletedCount > 0) {
      console.log(
        `🧹 Изчистени ${deletedCancelled.deletedCount} отказани записа.`
      );
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin12345", 10);

      await User.create({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "System",
        phone: "0000000000",
        role: "admin",
      });

      console.log("✅ Служебен акаунт създаден: admin / admin12345");
    }
  } catch (err) {
    console.error("❌ Грешка при създаване на админ:", err);
  }
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    const s = await Settings.findOne();
    if (!s) await Settings.create({});
    console.log("✅ DB Connected successfully");

    await seedAdmin();
    await cleanupOldAppointments();
    setInterval(cleanupOldAppointments, 3600000);

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ DB Error:", err));
