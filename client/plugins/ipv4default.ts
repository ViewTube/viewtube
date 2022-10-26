/* 
This plugin sets the node default dns result order to ipv4 first
This is necessary, because the default resolve order has been changed in node 17
See: https://github.com/nodejs/node/issues/40537#issuecomment-1237194449
*/

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.hook('app:created', async () => {
    try {
      const dns = await import('dns').catch(() => {
        // Drop silently
      });

      if (dns && dns.setDefaultResultOrder && typeof dns.setDefaultResultOrder === 'function') {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch {
      // Drop silently
    }
  });
});
