import { makeAsyncActions } from '../../utils'

// ####################################
// Action Constants
// ####################################

export const {
  FETCH_MARKETS,
} = makeAsyncActions('MARKETS', [
  'FETCH_MARKETS',
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
      request:{
        url:'/v1/region/markets/'
      }
    }
  }
}
