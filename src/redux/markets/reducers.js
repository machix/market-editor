import {
  FETCH_MARKETS,
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
