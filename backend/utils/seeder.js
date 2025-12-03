const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // 1. Проверяваме дали вече има такъв потребител в базата
    const adminExists = await User.findOne({ username: "admin" });

    if (!adminExists) {
      // 2. Дефинираме парола (може да е от .env или твърда стойност за тест)
      const plainPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin12345";

      // 3. Хешираме паролата
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 4. Създаваме записа
      await User.create({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin", // Задължително поле според схемата
        lastName: "System", // Задължително поле според схемата
        phone: "0000000000", // Задължително поле (фиктивен номер)
        role: "admin", // ВАЖНО: Тук даваме админ правата
        isBlocked: false,
        noShowCount: 0,
      });

      console.log(`✅ Служебен акаунт създаден успешно.`);
      console.log(`   User: admin`);
      console.log(`   Pass: ${plainPassword}`);
    } else {
      // Ако искаш да виждаш съобщение при всеки старт, разкоментирай долния ред:
      // console.log("ℹ️ Админ акаунтът вече съществува. Пропускане на създаването.");
    }
  } catch (err) {
    console.error("❌ Грешка при създаване на админ:", err);
  }
};

module.exports = seedAdmin;
