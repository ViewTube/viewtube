self.addEventListener('push', (event) => {
  event.waitUntil(
    event.data.json().then((data) => {
      const video = data.video ? data.video : null

      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        image: video ? video.videoThumbnails[2].url : null
      })
    })
  )
})
