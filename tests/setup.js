process.env.NODE_ENV = 'test'
global.__DEV__ = true

require('babel-register')()
