export function createApi(api) {
  Object.entries(api.requests).forEach(el => {
    api.api[el[0]] = async function (args = {}) {
      let url = el[1].url
      if (args.id) {
        url += `/${args.id}`
        delete args.id
      }
      if (el[1].fields) {
        if (!args.params) {
          args.params = {}
        }
        args.params.fields = el[1].fields.toString()
      }
      return api.request.get(url, args).catch((error) => {
        // store.dispatch('createMessage', {
        //   type: 'error',
        //   title: 'Error loading page',
        //   message: `Try<br/>
        //                   <ul><li>Checking your internet connection</li>
        //                   <li>Switching to another instance in settings</li></ul>`,
        //   dismissDelay: 0
        // })
        console.error(error)
      })
    }
  })
  return api
}
