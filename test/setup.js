process.env.NODE_ENV = 'test'
global.__DEV__ = true

require('babel-register')()

require('react-native-mock/mock')

const jsdom = require('jsdom').jsdom

global.document = jsdom('<body></body>')
global.window = document.defaultView
global.navigator = window.navigator
