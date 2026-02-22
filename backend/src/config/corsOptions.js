// src/config/corsOptions.js
const allowedOrigins = [
  "http://localhost:3000",
  "https://barber-shop-app2.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаваме заявки без origin (напр. Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

module.exports = corsOptions;
