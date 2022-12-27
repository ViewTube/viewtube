export function createApi(api: any) {
  Object.entries(api.requests).forEach((el: any) => {
    api[el[0]] = function (args: any = {}) {
      let url = el[1].url;
      if (args.id) {
        url += `/${args.id}`;
        delete args.id;
      }
      if (el[1].fields) {
        if (!args.params) {
          args.params = {};
        }
        args.params.fields = el[1].fields.toString();
      }
      return api.request.get(url, { ...args, withCredentials: true });
    };
  });
  return api;
}
