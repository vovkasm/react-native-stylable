
import Benchmark from 'benchmark'

import benchStylesheet from './benchStylesheet'

const suite = new Benchmark.Suite()

suite.add('Stylesheet#getProps', benchStylesheet)

suite.on('cycle', function (e) {
  console.log(String(e.target))
  if (e.target.error) {
    console.log('Error: ', e.target.error)
  }
})
suite.on('complete', function () {
  console.log('Done')
})
suite.run()
