import {
  Kuzzle,
  WebSocket
} from 'kuzzle-sdk'

export default new Kuzzle(new WebSocket('kuzzle.mcdn.ch'), {
  defaultIndex: 'viewtube'
})
