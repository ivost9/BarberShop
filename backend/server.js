require("dotenv").config();
const express = require("express");
const cors = require("cors");
const settingsRoute = require("./src/routes/settings");
const authRoute = require("./src/routes/auth");
const userRoute = require("./src/routes/user");
const appointmentsRoute = require("./src/routes/appointments");
const adminRoute = require("./src/routes/admin");
const connectDB = require("./src/config/db");
const corsOptions = require("./src/config/corsOptions");
const seedAdmin = require("./src/utils/seedAdmin");
const startCronJobs = require("./src/utils/cronJobs");

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
// --- КОНФИГУРАЦИЯ ---
const PORT = process.env.PORT || 5000;

// --- ROUTES ---
app.use("/api/settings", settingsRoute);
app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api", appointmentsRoute);
app.use("/api/admin", adminRoute);

const startServer = async () => {
  try {
    // 1. Свързване с базата данни
    await connectDB();

    // 2. Изпълнение на начални скриптове
    await seedAdmin();
    startCronJobs();

    // 3. Стартиране на сървъра
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
