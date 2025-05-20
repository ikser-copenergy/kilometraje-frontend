self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting(); // opcional
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
});

self.addEventListener('fetch', (event) => {
  // Puedes hacer caching aquí si deseas
  console.log('Interceptando:', event.request.url);
});
