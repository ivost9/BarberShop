const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointmentSchema");
const User = require("../models/userSchema");
const auth = require("../middleware/auth");

// Оригинален път: /api/appointments
router.get("/appointments", async (req, res) => {
  const appointments = await Appointment.find({ status: "active" });
  res.json(appointments);
});

// Оригинален път: /api/book
router.post("/book", auth, async (req, res) => {
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

// Оригинален път: /api/cancel
router.post("/cancel", auth, async (req, res) => {
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

module.exports = router;
