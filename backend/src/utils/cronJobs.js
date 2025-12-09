const Appointment = require("../models/appointmentSchema");

const cleanupOldAppointments = async () => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Изтриване на стари
    await Appointment.deleteMany({ date: { $lt: cutoffDate } });

    // Изтриване на отказани
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

// Функция за стартиране на интервала
const startCronJobs = () => {
  // Първоначално почистване
  cleanupOldAppointments();
  // Почистване на всеки час (3600000 ms)
  setInterval(cleanupOldAppointments, 3600000);
};

module.exports = startCronJobs;
