const Appointment = require("../models/Appointment");

const cleanupOldAppointments = async () => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await Appointment.deleteMany({ date: { $lt: cutoffDate } });
    await Appointment.deleteMany({ status: "cancelled" });
    // console.log("Cleanup finished");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
};

module.exports = cleanupOldAppointments;
