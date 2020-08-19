self.addEventListener('push', (event) => {
  const data = event.data.json()
  const video = data.video ? data.video : null

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    image: video ? video.videoThumbnails[2].url : null
  })
})
