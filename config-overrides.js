const rewireLess = require('react-app-rewire-less-modules')
const rewireLodash = require('react-app-rewire-lodash')

module.exports = function override(config, env) {
  config = rewireLodash(config, env)

  config = rewireLess.withLoaderOptions({
    modifyVars: {},
  })(config, env)

  return config
}
