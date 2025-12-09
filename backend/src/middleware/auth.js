const jwt = require("jsonwebtoken");

// Уверете се, че тази тайна фраза съвпада с тази, с която сте създали токена при логин!
// Най-добре е да е в process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

const auth = (req, res, next) => {
  // 1. Взимане на токена от хедъра
  const token = req.header("Authorization");

  // 2. Проверка дали токенът съществува
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // 3. Верификация на токена
    // Тук библиотеката проверява дали токенът е истински и дали не е изтекъл
    const verified = jwt.verify(token, JWT_SECRET);

    // 4. Закачане на потребителя към заявката
    // Това е ключовата стъпка, която позволява да ползвате req.user в другите файлове
    req.user = verified;

    // 5. Продължаване към следващата функция (route)
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = auth;
