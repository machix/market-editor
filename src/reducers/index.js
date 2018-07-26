import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'
import { marketList, market } from './markets'

export default combineReducers({
  notifications: notificationsReducer(),
  marketList,
  market,
})
