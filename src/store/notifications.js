import kuzzle from '@/services/kuzzle.js'

export default {
  state: {
    errorMessage: null
  },
  notificationCallback (notification) {
    console.log(notification)
    /*
    { status: 200,
      requestId: '1850b835-d82d-4bce-abec-bf593a578763',
      timestamp: 1539680191720,
      volatile: { sdkVersion: '6.0.0-beta-2' },
      index: 'nyc-open-data',
      collection: 'yellow-taxi',
      controller: 'document',
      action: 'create',
      protocol: 'websocket',
      scope: 'in',
      result:
        { _source:
          { name: 'nina vkote',
            age: 19,
            _kuzzle_info:
              { author: '-1',
                createdAt: 1539680191720,
                updatedAt: null,
                updater: null,
                active: true,
                deletedAt: null } },
          _id: 'AWZ8F0TpJD41ulNI_b-v' },
      type: 'document',
      room: '14b675feccf5ac320456ef0dbdf6c1fa-7a90af8c8bdaac1b' }
    */
    console.log(notification)
    if (notification.scope === 'in') {
      console.log(`Document ${notification.result._source.name} enter the scope`)
    } else {
      console.log(`Document ${notification.result._source.name} leave the scope`)
    }
  },
  async subscribeMessages () {
    try {
      await kuzzle.connect()
      await kuzzle.realtime.subscribe('notifications', 'viewtube', {
        exists: 'title'
      }, function (notification) {
        console.log(notification)
      }, {
        scope: 'all',
        users: 'all',
        subscribeToSelf: true
      })
      console.log('subscribed')
    } catch (error) {
      console.log(error.message)
    }
  }
}
