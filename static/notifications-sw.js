self.addEventListener('push', (event) => {
  const data = event.data.json()

  console.log('push push push', event)

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    image: '/icon-192.png'
  })
})