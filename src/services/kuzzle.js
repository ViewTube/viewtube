import {
  Kuzzle,
  WebSocket
} from 'kuzzle-sdk'

export default new Kuzzle(new WebSocket('http://kuzzle.mcdn.ch'), {
  defaultIndex: 'viewtube'
})
