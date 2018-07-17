import axios from 'axios'

const configureApi = baseURL => {
  axios.defaults.baseURL = baseURL
  axios.defaults.withCredentials = true
  axios.defaults.headers.common.Accept = 'application/json'
  axios.defaults.headers.common['Content-Type'] = 'application/json'
  axios.defaults.headers.common['Client-Version'] = 'web version 2.0'

  const csrfToken = document.cookie
    .split(';')
    .filter(e => e.indexOf('csrf_token') > -1)[0]

  if (csrfToken) {
    axios.defaults.headers['X-CSRFToken'] = decodeURIComponent(
      csrfToken.trim().substring(11)
    )
  }
}

export default configureApi
