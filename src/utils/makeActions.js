function makeAction(namespace = '', action = '') {
  return `${namespace}/${action.toUpperCase()}`
}

function makeActions(namespace, actions = [], nested) {
  if (Array.isArray(actions) && Array.isArray(nested)) {
    return actions.reduce((newActions, action) => ({
      ...newActions,
      [action]: makeActions(`${namespace}/${action.toUpperCase()}`, nested),
    }), {})
  }
  if (Array.isArray(actions)) {
    return actions.reduce((obj, action) => ({
      ...obj,
      [action]: makeAction(namespace, action),
    }), {})
  }

  throw new Error('Actions must be an array.')
}

function makeAsyncAction(namespace, action) {
  if (!namespace) {
    throw new Error('Please provide a namespace for your actions')
  }
  return makeActions(`${namespace}/${action.toUpperCase()}`, [
    'IN_PROGRESS',
    'SUCCESS',
    'FAIL',
  ])
}

function makeAsyncActions(namespace, actions = []) {
  if (Array.isArray(actions)) {
    return actions.reduce((newActions, action) => ({
      ...newActions,
      [action]: makeAsyncAction(namespace, action),
    }), {})
  }

  throw new Error('Actions must be an array.')
}

export {
  makeAction,
  makeActions,
  makeAsyncAction,
  makeAsyncActions,
}
