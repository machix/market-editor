import {
  FETCH_MARKETS,
} from './actions'

export const markets = (
  state = {},
  action
) => {
  switch (action.type) {
    case FETCH_MARKETS.SUCCESS:
      return { ...state, ...action.payload.data }
    default:
      return state
  }
}
