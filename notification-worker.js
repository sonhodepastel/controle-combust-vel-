self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: 'icon-192x192.png',
        sound: 'notification.mp3'
    };
    self.registration.showNotification(data.title, options);
});
