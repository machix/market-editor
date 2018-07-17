import {
  FETCH_MARKETS,
  FETCH_MARKET,
  UPDATE_DISTRICT,
  UPDATE_STARTING_POINT,
} from './actions'
import { findIndex } from 'lodash'

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
    case UPDATE_DISTRICT.IN_PROGRESS:
      return { ...state, loading: true }
    case UPDATE_DISTRICT.SUCCESS:
      const district = action.payload.data
      const districts = [...state.data.districts]
      districts.splice(findIndex(districts, { id: district.id }), 1, { ...district })
      return { ...state, data: { ...state.data, districts: [...districts] }, loading: false }
    case UPDATE_DISTRICT.FAIL:
      return { ...state, loading: false }
    case UPDATE_STARTING_POINT.IN_PROGRESS:
      return { ...state, loading: true }
    case UPDATE_STARTING_POINT.SUCCESS:
      const starting_point = action.payload.data
      const starting_points = [...state.data.starting_points]
      starting_points.splice(findIndex(starting_points, { id: starting_point.id }), 1, { ...starting_point })
      return { ...state, data: { ...state.data, starting_points: [...starting_points] }, loading: false }
    case UPDATE_STARTING_POINT.FAIL:
      return { ...state, loading: false }
    default:
      return state
  }
}
