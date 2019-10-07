import Commons from '@/commons.js'

export default {
  register(username, password) {
    return new Promise((resolve, reject) => {
      if (username && password) {
        if (username !== '' && password !== '') {
          fetch(`${Commons.authUrl}register.php`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password
            })
          })
            .then(response => {
              if (response.ok) {
                resolve(response.json())
              } else {
                reject(response.json())
              }
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
