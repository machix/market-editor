import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'
import { markets, market } from './markets/reducers'

export default combineReducers({
  notifications: notificationsReducer(),
  markets,
  market,
})
