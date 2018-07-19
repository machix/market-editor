import { makeAsyncActions } from '../../utils'

// ####################################
// Action Constants
// ####################################

export const {
  FETCH_MARKETS,
  FETCH_MARKET,
  CREATE_DISTRICT,
  UPDATE_DISTRICT,
  DELETE_DISTRICT,
  CREATE_STARTING_POINT,
  UPDATE_STARTING_POINT,
  DELETE_STARTING_POINT,
} = makeAsyncActions('MARKETS', [
  'FETCH_MARKETS',
  'FETCH_MARKET',
  'CREATE_DISTRICT',
  'UPDATE_DISTRICT',
  'DELETE_DISTRICT',
  'CREATE_STARTING_POINT',
  'UPDATE_STARTING_POINT',
  'DELETE_STARTING_POINT',
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
        url:'/v1/region/markets/?fields=id&fields=name&fields=center&fields=is_active'
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
        url:`/v1/region/markets/${id}/?simplified_geom=true`
      }
    }
  }
}

export function createDistrict(data) {
  return {
    types: [
      ...Object.values(CREATE_DISTRICT)
    ],
    payload: {
      request: {
        method: 'POST',
        url:`/v1/region/districts/`,
        data,
      }
    }
  }
}

export function updateDistrict(id, data) {
  return {
    types: [
      ...Object.values(UPDATE_DISTRICT)
    ],
    payload: {
      request: {
        method: 'PATCH',
        url:`/v1/region/districts/${id}/`,
        data,
      }
    }
  }
}


export function deleteDistrict(id) {
  const data = {
    geom: {
      type: 'MultiPolygon',
      coordinates: [],
    }
  }
  return {
    types: [
      ...Object.values(DELETE_DISTRICT)
    ],
    payload: {
      request: {
        method: 'PATCH',
        url:`/v1/region/districts/${id}/`,
        data,
      }
    }
  }
}

export function createStartingPoint(data) {
  return {
    types: [
      ...Object.values(CREATE_STARTING_POINT)
    ],
    payload: {
      request: {
        method: 'POST',
        url:`/v1/region/starting_points/`,
        data,
      }
    }
  }
}

export function updateStartingPoint(id, data) {
  return {
    types: [
      ...Object.values(UPDATE_STARTING_POINT)
    ],
    payload: {
      request: {
        method: 'PATCH',
        url:`/v1/region/starting_points/${id}/`,
        data,
      }
    }
  }
}

export function deleteStartingPoint(id) {
  const data = {
    geom: {
      type: 'MultiPolygon',
      coordinates: [],
    }
  }
  return {
    types: [
      ...Object.values(DELETE_STARTING_POINT)
    ],
    payload: {
      request: {
        method: 'PATCH',
        url:`/v1/region/starting_points/${id}/`,
        data,
      }
    }
  }
}
