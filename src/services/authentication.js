import Commons from '@/commons.js'

export default {
  register(username, password) {
    return new Promise((resolve, reject) => {
      if (username && password) {
        if (username !== '' && password !== '') {
          fetch(`${Commons.authUrl}register.php`, {
            method: 'POST',
            body: JSON.stringify({
              username: username,
              password: password
            })
          })
            .then(response => response.json())
            .then(data => {
              resolve(data)
            })
            .catch(error => {
              reject(error)
            })
        } else {
          reject(new Error('Username or password can\'t be empty'))
        }
      } else {
        reject(new Error('Username or password can\'t be empty'))
      }
    })
  }
}
