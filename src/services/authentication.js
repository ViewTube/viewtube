import Commons from '@/commons.js'

export default {
  register (username, password, captcheckSessionCode, captcheckSelectedAnswer) {
    return new Promise((resolve, reject) => {
      if (username && password) {
        if (username !== '' && password !== '') {
          fetch(`${Commons.getOwnApiUrl()}register.php`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password,
              captcheck_session_code: captcheckSessionCode,
              captcheck_selected_answer: captcheckSelectedAnswer
            })
          })
            .then(response => {
              console.log('error')
              if (response.ok) {
                resolve(response.json())
              } else {
                console.log('error')
                reject(response.json())
              }
            }).catch(error => {
              console.log(error)
              reject(error)
            })
        } else {
          reject(new Error('Username or password can\'t be empty'))
        }
      } else {
        reject(new Error('Username or password can\'t be empty'))
      }
    })
  },
  login (username, password) {
    return new Promise((resolve, reject) => {
      if (username && password) {
        if (username !== '' && password !== '') {
          fetch(`${Commons.getOwnApiUrl()}login.php`, {
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
            }).catch(error => {
              console.log(error)
              reject(error)
            })
        } else {
          reject(new Error('Username or password can\'t be empty'))
        }
      } else {
        reject(new Error('Username or password can\'t be empty'))
      }
    })
  },
  getUser (jwt) {
    return new Promise((resolve, reject) => {
      if (jwt) {
        if (jwt !== '') {
          fetch(`${Commons.getOwnApiUrl()}getUser.php`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${jwt}`
            }
          })
            .then(response => {
              if (response.ok) {
                resolve(response.json())
              } else {
                reject(response.json())
              }
            }).catch(error => {
              console.log(error)
              reject(error)
            })
        } else {
          reject(new Error('Error retrieving user information'))
        }
      } else {
        reject(new Error('Error retrieving user information'))
      }
    })
  }
}
