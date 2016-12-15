
import Benchmark from 'benchmark'

import Stylesheet from '../src/stylesheet'

const s = new Stylesheet()
s.addRules({
  stdFont: {style: {fontFamily: 'Helvetica'}},
  pdLeft: {style: {paddingLeft: 2}},
  pdRight: {style: {paddingRight: 2}},
  pdHorizontal: {mixins: ['pdLeft', 'pdRight']},
  baseText: {mixins: ['stdFont', 'pdHorizontal'], style: {fontSize: 12}},
  baseText2: {mixins: ['stdFont'], style: {fontSize: 11}},
  Button: {
    props: {
      color: '#bf7650'
    }
  }
})
s.addDefaultRules({
  'Rule1': {},
  'Rule2': {},
  'Rule3': {},
  'Rule4': {},
  'Rule5': {},
  'Rule6': {},
  'Rule7': {},
  'Rule8': {},
  'Rule9': {},
  'Rule10': {}
})
s.addDefaultRules({
  AppView: {
    style: {
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'stretch',
      paddingTop: 20,
      flexGrow: 1
    }
  }
})
s.addDefaultRules({
  'AppView Item': {
    style: {
      borderWidth: 1,
      borderColor: 'rgb(240,240,240)',
      margin: 4,
      flex: 1
    }
  },
  'AppView Item Description': {
    style: {
      marginHorizontal: 12
    }
  },
  'AppView Item PriceText': {
    mixins: ['baseText'],
    style: {
      fontWeight: 'bold'
    }
  },
  'AppView Item Text': {
    mixins: ['baseText'],
    style: {
      marginVertical: 6
    }
  },
  'AppView Item Image': {
    style: {
      left: 0,
      right: 0,
      height: 160
    }
  }
})
s.addDefaultRules({
  'Rule1 Text': {style: {flex: 1}},
  'Rule2 Text': {style: {flex: 1}},
  'Rule3 Text': {style: {flex: 1}},
  'Rule4 Text': {style: {flex: 1}},
  'Rule5 Text': {style: {flex: 1}},
  'Rule6 Text': {style: {flex: 1}},
  'Rule7 Text': {style: {flex: 1}}
})

const suite = new Benchmark.Suite()
let props
suite.add('plain props', function () {
  const p = {style: {fontSize: 8}}
  props = p
  if (props.style.fontSize !== 8) {
    throw new Error('fontSize != 8')
  }
})
suite.add('new theme & props (cached)', function () {
  props = s.getProps('App AppView Elem Item Text', {prop1: 1})
  if (props.style.fontSize !== 12) {
    throw new Error('fontSize != 12')
  }
})
suite.add('new theme & props (no cache)', function () {
  props = s.getProps('App AppView Elem Item Text', {prop1: 1})
  if (props.style.fontSize !== 12) {
    throw new Error('fontSize != 12')
  }
  s.cache = {}
})
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
