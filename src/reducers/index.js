import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'
import { markets, market } from './markets'

export default combineReducers({
  notifications: notificationsReducer(),
  markets,
  market,
})
