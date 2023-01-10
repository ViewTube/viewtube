export default defineEventHandler(event => {
  return {
    url: event.node.req.url,
    method: event.node.req.method,
    headers: event.node.req.headers,
    body: readBody(event),
    query: getQuery(event)
  };
});
