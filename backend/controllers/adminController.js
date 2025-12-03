const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Settings = require("../models/Settings");

// Помощна функция за проверка на права (DRY principle)
const checkAdmin = (user) => {
  if (user.role !== "admin") throw new Error("No access");
};

// 7. GET ALL APPOINTMENTS (Admin View)
exports.getAllAppointments = async (req, res) => {
  try {
    checkAdmin(req.user);
    // Взимаме всичко, което не е cancelled (въпреки че ги трием, за безопасност)
    const apps = await Appointment.find({ status: { $ne: "cancelled" } }).sort({
      date: -1,
    });
    res.json(apps);
  } catch (err) {
    if (err.message === "No access") return res.status(403).send("No access");
    res.status(500).json({ error: "Server error" });
  }
};

// 8. GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    checkAdmin(req.user);
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ firstName: 1 });
    res.json(users);
  } catch (err) {
    if (err.message === "No access") return res.status(403).send("No access");
    res.status(500).json({ error: "Server error" });
  }
};

// 9. MARK NO SHOW
exports.markNoShow = async (req, res) => {
  try {
    checkAdmin(req.user);
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
  } catch (err) {
    if (err.message === "No access") return res.status(403).send("No access");
    res.status(500).json({ error: "Server error" });
  }
};

// 10. TOGGLE REGISTRATION
exports.toggleRegistration = async (req, res) => {
  try {
    checkAdmin(req.user);
    const settings = await Settings.findOne();
    settings.acceptingNewClients = !settings.acceptingNewClients;
    await settings.save();

    res.json({
      message: "Settings updated",
      acceptingNewClients: settings.acceptingNewClients,
    });
  } catch (err) {
    if (err.message === "No access") return res.status(403).send("No access");
    res.status(500).json({ error: "Server error" });
  }
};
