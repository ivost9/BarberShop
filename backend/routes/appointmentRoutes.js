const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const auth = require("../middleware/authMiddleware");

// Публични пътища (или достъпни без пълен логин, зависи от логиката, тук ги оставям отворени както в оригинала)
router.get("/settings", appointmentController.getSettings);
router.get("/appointments", appointmentController.getActiveAppointments);

// Защитени пътища (изискват Token)
router.post("/book", auth, appointmentController.bookAppointment);
router.post("/cancel", auth, appointmentController.cancelAppointment);

module.exports = router;
