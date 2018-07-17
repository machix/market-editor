import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureApi from './utils/configureApi'
import configureStore from './redux/configureStore'
import './index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

// export default function main(container, options) {
  const apiUrl = 'http://api.doordash.localhost'
  // const apiUrl = options.apiUrl || 'https://api.doordash.com'

  const store = configureStore()
  configureApi(apiUrl)

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )
  registerServiceWorker()
// }
