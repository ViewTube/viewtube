// Nuxt middleware to add headers to the server response
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:response', response => {
    response.headers['Accept-CH'] = 'Sec-CH-Prefers-Color-Scheme';
    response.headers['Vary'] = 'Sec-CH-Prefers-Color-Scheme';
    response.headers['Critical-CH'] = 'Sec-CH-Prefers-Color-Scheme';
  });
});
