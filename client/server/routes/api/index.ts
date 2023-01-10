export default defineEventHandler(event => {
  const apiUrl = `http://localhost:${process.env.API_DEV_PORT}`;

  const url = new URL(event.node.req.url, apiUrl);

  const headers = event.node.req.headers as Record<string, string>;

  delete headers['x-forwarded-for'];
  delete headers['x-forwarded-host'];
  delete headers['x-forwarded-proto'];
  delete headers['x-forwarded-port'];
  delete headers['host'];
  delete headers['connection'];
  delete headers['upgrade-insecure-requests'];
  delete headers['sec-gpc'];
  delete headers['sec-fetch-site'];
  delete headers['sec-fetch-mode'];
  delete headers['sec-fetch-dest'];
  delete headers['sec-fetch-user'];

  const requestConfig: any = {
    method: event.node.req.method,
    headers: headers,
    query: getQuery(event)
  };

  const incomingBody = readBody(event);
  const bodyDisallowed = event.node.req.method === 'GET' || event.node.req.method === 'HEAD';

  if (!bodyDisallowed && Object.entries(incomingBody).length < 0) {
    requestConfig.body = incomingBody;
  }

  console.log(event.node.req.headers);

  return $fetch(url.href, requestConfig);
});
