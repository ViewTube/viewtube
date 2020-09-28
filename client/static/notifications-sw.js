/* eslint-disable no-undef */
self.addEventListener('push', event => {
  event.waitUntil(
    new Promise(resolve => {
      const data = event.data.json();
      const video = data.video ? data.video : null;

      return self.registration
        .showNotification(data.title, {
          body: data.body,
          icon: '/icon-192.png',
          image: video ? video.videoThumbnails[2].url : null
        })
        .then(() => {
          resolve(true);
        });
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  const clickedNotification = event.notification;
  clickedNotification.close();

  if (!event.action && clickedNotification.data.video) {
    const url = `https://viewtube.io/watch?v=${clickedNotification.data.videox}`;
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true
        })
        .then(windowClients => {
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});
