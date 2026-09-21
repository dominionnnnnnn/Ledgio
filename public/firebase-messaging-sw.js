/* Background push for Ledgio.
 * Firebase looks for this exact file at the site root, and a service worker can't read .env,
 * so the config is written out here. These values are public (they ship in the app anyway);
 * the Firestore rules are what protect the data.
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCV_FXjHbKLlP6mcVbdauUYFXh5iagafKo',
  authDomain: 'ledgio-18ea4.firebaseapp.com',
  projectId: 'ledgio-18ea4',
  storageBucket: 'ledgio-18ea4.firebasestorage.app',
  messagingSenderId: '227113666336',
  appId: '1:227113666336:web:54af5d29020165b9147945',
});

const messaging = firebase.messaging();

// Shown when Ledgio is closed or in the background.
messaging.onBackgroundMessage(({ data = {} }) => {
  self.registration.showNotification(data.title || 'Ledgio', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'ledgio',
    data: { link: data.link || '/app' },
  });
});

// Tapping it opens Ledgio at the right screen, reusing an open tab if there is one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.url.includes(self.location.origin) && 'focus' in tab) {
          tab.navigate(link);
          return tab.focus();
        }
      }
      return clients.openWindow(link);
    }),
  );
});
