import { compose, createStore, applyMiddleware } from 'redux'
import axios from 'axios'
import axiosMiddleware from 'redux-axios-middleware'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'

export default function configureStore(initialState = {}) {
  const client = axios.create()

  const authToken = localStorage.getItem('authToken')
  if (authToken) {
      client.defaults.headers.common['Authorization'] = `JWT ${authToken}`
  } else {
    console.log('Error: No authentication token found!')
  }

  const enhancers = []
  const middleware = [
    thunk,
    axiosMiddleware(client),
  ]

  if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.devToolsExtension
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }

  const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
  )

  return createStore(
    rootReducer,
    initialState,
    composedEnhancers,
  )
}
