const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Settings = require("../models/Settings");

exports.register = async (req, res) => {
  // 1. Проверка за settings
  const settings = await Settings.findOne();
  if (settings && !settings.acceptingNewClients) {
    return res
      .status(403)
      .json({ error: "За съжаление, в момента не приемаме нови клиенти." });
  }

  const { username, password, firstName, lastName, phone } = req.body;
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: "Моля попълнете всички полета." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  if (user.isBlocked)
    return res.status(403).json({ error: "Профилът е блокиран." });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET || "secret_diploma_key_123"
  );

  res.json({
    token,
    role: user.role,
    username: user.username /* др. полета */,
  });
};
