
import Benchmark from 'benchmark'

import benchStylesheet from './benchStylesheet'
import selectorsBenchmarks from './benchSelectors'

const suite = new Benchmark.Suite()

for (let i = 0; i < selectorsBenchmarks.length; ++i) {
  suite.add(selectorsBenchmarks[i])
}

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
