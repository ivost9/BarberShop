const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

// Всички тези пътища минават през auth middleware първо
// Самата проверка за admin роля е вътре в контролера (или може да се направи втори middleware 'isAdmin')

router.get("/all", auth, adminController.getAllAppointments);
router.get("/users", auth, adminController.getAllUsers);
router.post("/noshow", auth, adminController.markNoShow);
router.post("/toggle-registration", auth, adminController.toggleRegistration);

module.exports = router;
