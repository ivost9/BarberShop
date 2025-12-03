const Appointment = require("../models/Appointment");
const Settings = require("../models/Settings");
const User = require("../models/User");

// 0. GET SETTINGS (Публичен достъп - за да знае фронтендът дали да показва бутони)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 4. GET APPOINTMENTS (Само активните, за календара)
exports.getActiveAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: "active" });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 5. BOOK APPOINTMENT
exports.bookAppointment = async (req, res) => {
  try {
    const { date, serviceType } = req.body;
    const duration = serviceType === "full" ? 60 : 30;

    // Валидация за валидна дата
    const requestedStart = new Date(date);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    // 1. Проверка: Има ли потребителят вече активен час?
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

    // 2. Проверка за конфликти в графика
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
      // Формула за пресичане на времеви интервали
      return appStart < requestedEnd && appEnd > requestedStart;
    });

    if (hasConflict) {
      return res.status(400).json({ error: "Този час вече е зает." });
    }

    // 3. Създаване на записа
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
};

// 6. CANCEL APPOINTMENT
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.body;
    const appointment = await Appointment.findById(id);

    if (!appointment) return res.status(404).json({ error: "Not found" });

    // Проверка за 12 часа (ако не е админ)
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
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed" });
  }
};
