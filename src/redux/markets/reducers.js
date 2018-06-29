import {
  FETCH_MARKETS,
} from './actions'

export const markets = (
  state = {
    loading: false,
    data: [],
  },
  action
) => {
  switch (action.type) {
    case FETCH_MARKETS.IN_PROGRESS:
      return { ...state, loading: true }
    case FETCH_MARKETS.SUCCESS:
      return { data: [...action.payload.data], loading: false }
    default:
      return state
  }
}
