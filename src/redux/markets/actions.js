import { makeAsyncActions } from '../../utils'

// ####################################
// Action Constants
// ####################################

export const {
  FETCH_MARKETS,
  FETCH_MARKET,
} = makeAsyncActions('MARKETS', [
  'FETCH_MARKETS',
  'FETCH_MARKET',
])

// ####################################
// Action Creators
// ####################################

export function fetchMarkets() {
  return {
    types: [
      ...Object.values(FETCH_MARKETS)
    ],
    payload: {
      request: {
        url:'/v1/region/markets/'
      }
    }
  }
}

export function fetchMarket(id) {
  return {
    types: [
      ...Object.values(FETCH_MARKET)
    ],
    payload: {
      request: {
        url:`/v1/region/markets/${id}/?districts_info_only=true&geom=true`
      }
    }
  }
}
