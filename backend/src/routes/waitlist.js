const express = require("express");
const router = express.Router();
const Waitlist = require("../models/waitlistSchema");
const auth = require("../middleware/auth");

// GET /api/waitlist/my -> Връща списъка на текущия потребител
router.get("/my", auth, async (req, res) => {
  try {
    // Вземаме записите само за текущия потребител (req.user._id идва от auth токена)
    const lists = await Waitlist.find({ userId: req.user._id }).sort({
      date: 1,
    });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: "Грешка при извличане на списъка." });
  }
});

// POST /api/waitlist/join -> Записва потребителя за известие
router.post("/join", auth, async (req, res) => {
  try {
    const { date, subscription } = req.body;
    const slotDate = new Date(date);

    // Проверка дали вече чака за този конкретен час
    const existing = await Waitlist.findOne({
      userId: req.user._id,
      date: slotDate,
    });

    if (existing) {
      return res.status(400).json({ error: "Вече сте в списъка за този час." });
    }

    await Waitlist.create({
      userId: req.user._id,
      username: req.user.username,
      date: slotDate,
      subscription: subscription, // Важно за Push известията!
    });

    res.json({
      success: true,
      message: "Ще бъдете известени при освобождаване!",
    });
  } catch (err) {
    console.error("Waitlist Join Error:", err);
    res.status(500).json({ error: "Грешка при записване в списъка." });
  }
});

module.exports = router;
