import {
  FETCH_MARKETS,
  FETCH_MARKET,
} from './actions'

export const markets = (
  state = {
    data: [],
    loading: false,
  },
  action
) => {
  switch (action.type) {
    case FETCH_MARKETS.IN_PROGRESS:
      return { ...state, loading: true }
    case FETCH_MARKETS.SUCCESS:
      return { data: [...action.payload.data], loading: false }
    case FETCH_MARKETS.FAIL:
      return { ...state, loading: false }
    default:
      return state
  }
}

export const market = (
  state = {
    data: {},
    loading: false,
  },
  action
) => {
  switch (action.type) {
    case FETCH_MARKET.IN_PROGRESS:
      return { ...state, loading: true }
    case FETCH_MARKET.SUCCESS:
      return { data: { ...action.payload.data }, loading: false }
    case FETCH_MARKET.FAIL:
      return { ...state, loading: false }
    default:
      return state
  }
}
