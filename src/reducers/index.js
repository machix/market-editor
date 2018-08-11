import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'
import { marketList, selectedMarket } from './markets'

export default combineReducers({
  notifications: notificationsReducer(),
  marketList,
  selectedMarket,
})
