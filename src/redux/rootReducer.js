import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'
import { markets } from './markets/reducers'

export default combineReducers({
  notifications: notificationsReducer(),
  markets,
})
