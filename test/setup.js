process.env.NODE_ENV = 'test'
global.__DEV__ = true

const babelConfig = {}
if (process.env.ISTANBUL_COVERAGE === 'yes') {
  babelConfig.plugins = ['istanbul']
}
require('babel-register')(babelConfig)

require('react-native-mock/mock')

const jsdom = require('jsdom').jsdom

global.document = jsdom('<body></body>')
global.window = document.defaultView
global.navigator = window.navigator
