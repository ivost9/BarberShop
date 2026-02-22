const Appointment = require("../models/appointmentSchema");
const Waitlist = require("../models/waitlistSchema");
const notificationService = require("../services/notificationService");

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.body.id);
    if (!appointment)
      return res.status(404).json({ error: "Не е намерен такъв час." });

    const slotDate = appointment.date;
    await Appointment.findByIdAndDelete(req.body.id);

    // Логика за намиране на потребител от списъка (Waitlist)
    const startRange = new Date(slotDate);
    startRange.setMinutes(startRange.getMinutes() - 1);
    const endRange = new Date(slotDate);
    endRange.setMinutes(endRange.getMinutes() + 1);

    const luckyUser = await Waitlist.findOne({
      date: { $gte: startRange, $lte: endRange },
    }).sort({ createdAt: 1 });

    if (luckyUser) {
      await notificationService.sendWaitlistNotification(luckyUser, slotDate);
      await Waitlist.findByIdAndDelete(luckyUser._id);
    }

    res.json({ success: true, message: "Часът е отменен успешно." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
