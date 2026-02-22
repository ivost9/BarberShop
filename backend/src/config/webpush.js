const webpush = require("web-push");
require("dotenv").config();

const configureWebPush = () => {
  if (process.env.PUBLIC_VAPID_KEY && process.env.PRIVATE_VAPID_KEY) {
    webpush.setVapidDetails(
      "mailto:admin@barbershop.bg",
      process.env.PUBLIC_VAPID_KEY,
      process.env.PRIVATE_VAPID_KEY
    );
    console.log("✅ VAPID ключовете са заредени.");
  }
};

module.exports = configureWebPush;
