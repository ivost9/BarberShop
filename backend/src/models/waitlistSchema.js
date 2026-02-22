const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  // Добавяме userId, за да знаем точно на кой потребител е записа
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Референция към твоя модел за потребители
    required: true,
  },
  username: String,
  date: {
    type: Date,
    required: true,
  },
  serviceType: String,
  // Обектът със секретните ключове от браузъра на клиента
  subscription: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Waitlist", waitlistSchema);
