const webpush = require("web-push");

exports.sendWaitlistNotification = async (luckyUser, slotDate) => {
  if (!luckyUser || !luckyUser.subscription) return;

  const timeString = new Date(slotDate).toLocaleTimeString("bg-BG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const payload = JSON.stringify({
    title: "Свободен час! ✂️",
    body: `Часът за ${timeString} се освободи! Резервирай го веднага.`,
    icon: "/logo192.png",
    data: { url: "/dashboard" },
  });

  try {
    await webpush.sendNotification(luckyUser.subscription, payload);
    console.log(`📲 Известие изпратено до ${luckyUser.username}`);
  } catch (err) {
    console.error("📲 Push error:", err);
  }
};
