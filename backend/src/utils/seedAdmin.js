const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin12345", 10); // Добре е паролата да е в .env

      await User.create({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "System",
        phone: "0000000000",
        role: "admin",
      });

      console.log("✅ Служебен акаунт създаден: admin");
    }
  } catch (err) {
    console.error("❌ Грешка при създаване на админ:", err);
  }
};

module.exports = seedAdmin;
