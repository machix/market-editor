import {
  FETCH_MARKET_LIST,
  FETCH_MARKET,
  CREATE_DISTRICT,
  CREATE_STARTING_POINT,
  UPDATE_DISTRICT,
  UPDATE_STARTING_POINT,
  DELETE_DISTRICT,
  DELETE_STARTING_POINT,
} from '../actions'
import { findIndex } from 'lodash'

export const marketList = (
  state = {
    data: [],
    loading: false,
  },
  action
) => {
  switch (action.type) {
    case FETCH_MARKET_LIST.IN_PROGRESS:
      return { ...state, loading: true }
    case FETCH_MARKET_LIST.SUCCESS:
      return { data: [...action.payload.data], loading: false }
    case FETCH_MARKET_LIST.FAIL:
      return { ...state, loading: false }
    default:
      return state
  }
}

export const selectedMarket = (
  state = {
    data: {},
    loading: false,
  },
  action
) => {
  let district, districts, starting_point, starting_points
  switch (action.type) {
    case FETCH_MARKET.IN_PROGRESS:
      return { ...state, loading: true }

    case FETCH_MARKET.SUCCESS:
      return { data: { ...action.payload.data }, loading: false }

    case FETCH_MARKET.FAIL:
      return { ...state, loading: false }

    case CREATE_DISTRICT.IN_PROGRESS:
      return { ...state, loading: true }

    case CREATE_DISTRICT.SUCCESS:
      district = action.payload.data
      districts = [...state.data.districts]
      return { ...state, data: { ...state.data, districts: [...districts, district] }, loading: false }

    case CREATE_DISTRICT.FAIL:
      return { ...state, loading: false }

    case UPDATE_DISTRICT.IN_PROGRESS:
      return { ...state, loading: true }

    case UPDATE_DISTRICT.SUCCESS:
      district = action.payload.data
      districts = [...state.data.districts]
      districts.splice(findIndex(districts, { id: district.id }), 1, { ...district })
      return { ...state, data: { ...state.data, districts: [...districts] }, loading: false }

    case UPDATE_DISTRICT.FAIL:
      return { ...state, loading: false }

    case CREATE_STARTING_POINT.IN_PROGRESS:
      return { ...state, loading: true }

    case CREATE_STARTING_POINT.SUCCESS:
      starting_point = action.payload.data
      starting_points = [...state.data.starting_points]
      return { ...state, data: { ...state.data, starting_points: [...starting_points, starting_point] }, loading: false }

    case CREATE_STARTING_POINT.FAIL:
      return { ...state, loading: false }

    case UPDATE_STARTING_POINT.IN_PROGRESS:
      return { ...state, loading: true }

    case UPDATE_STARTING_POINT.SUCCESS:
      starting_point = action.payload.data
      starting_points = [...state.data.starting_points]
      starting_points.splice(findIndex(starting_points, { id: starting_point.id }), 1, { ...starting_point })
      return { ...state, data: { ...state.data, starting_points: [...starting_points] }, loading: false }

    case UPDATE_STARTING_POINT.FAIL:
      return { ...state, loading: false }

    case DELETE_DISTRICT.IN_PROGRESS:
      return { ...state, loading: true }

    case DELETE_DISTRICT.SUCCESS:
      district = action.payload.data
      districts = [...state.data.districts]
      districts.splice(findIndex(districts, { id: district.id }), 1, { ...district })
      return { ...state, data: { ...state.data, districts: [...districts] }, loading: false }

    case DELETE_DISTRICT.FAIL:
      return { ...state, loading: false }

    case DELETE_STARTING_POINT.IN_PROGRESS:
      return { ...state, loading: true }

    case DELETE_STARTING_POINT.SUCCESS:
      starting_point = action.payload.data
      starting_points = [...state.data.starting_points]
      starting_points.splice(findIndex(starting_points, { id: starting_point.id }), 1, { ...starting_point })
      return { ...state, data: { ...state.data, starting_points: [...starting_points] }, loading: false }

    case DELETE_STARTING_POINT.FAIL:
      return { ...state, loading: false }

    default:
      return state
  }
}
