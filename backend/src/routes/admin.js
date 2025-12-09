const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointmentSchema");
const User = require("../models/userSchema");
const Settings = require("../models/settingsSchema"); // Уверете се, че имате този модел
const auth = require("../middleware/auth");

// Оригинален път: /api/admin/all
// Тук пишем само "/all", защото ще го закачим на "/api/admin"
router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");
  const apps = await Appointment.find({ status: { $ne: "cancelled" } }).sort({
    date: -1,
  });
  res.json(apps);
});

// Оригинален път: /api/admin/users
router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-password")
    .sort({ firstName: 1 });
  res.json(users);
});

// Оригинален път: /api/admin/noshow
router.post("/noshow", auth, async (req, res) => {
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

// Оригинален път: /api/admin/toggle-registration
router.post("/toggle-registration", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("No access");

  const settings = await Settings.findOne();
  settings.acceptingNewClients = !settings.acceptingNewClients;
  await settings.save();

  res.json({
    message: "Settings updated",
    acceptingNewClients: settings.acceptingNewClients,
  });
});

module.exports = router;
