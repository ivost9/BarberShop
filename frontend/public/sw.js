// public/sw.js

self.addEventListener("push", (event) => {
  let data = { title: "Ново известие", body: "Имате актуализация." };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Грешка при парсване на Push данни:", e);
  }

  const options = {
    body: data.body,
    icon: "/logo192.png", // Увери се, че този файл съществува в public/
    badge: "/logo192.png",
    vibrate: [200, 100, 200], // Малко по-осезаема вибрация
    tag: "appointment-alert", // Предотвратява спам (дублиращите се известия се групират)
    data: {
      url: data.data?.url || "/", // Взема URL от сървъра или ползва главната страница
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Логика: Ако сайтът е отворен - фокусирай го. Ако не - отвори нов таб.
  const urlToOpen = new URL(event.notification.data.url, self.location.origin)
    .href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});
