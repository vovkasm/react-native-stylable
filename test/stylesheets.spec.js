import test from 'tape'

import Stylesheet from '../src/stylesheet'
import Node from '../src/node'

function nodeFromPath (styleSheet, fullPath, ownProps) {
  const pathChunks = fullPath.split(/\s+/)
  let node
  for (let i = 0; i < pathChunks.length; ++i) {
    const chunk = pathChunks[i]
    let name
    let props
    let dotPos = chunk.indexOf('.')
    if (dotPos === -1) {
      name = chunk
    } else {
      name = chunk.slice(0, dotPos)
      const variants = []
      while (dotPos !== -1) {
        const start = dotPos + 1
        dotPos = chunk.indexOf('.', start)
        if (dotPos === -1) {
          variants.push(chunk.slice(start))
        } else {
          variants.push(chunk.slice(start, dotPos))
        }
      }
      if (variants.length > 0) {
        props = {variant: variants}
      }
    }
    if (i === pathChunks.length - 1) {
      if (props === undefined) props = {}
      if (typeof ownProps === 'object') props = Object.assign(props, ownProps)
    }
    const curNode = new Node(name, props, node, styleSheet)
    curNode.subscribe()
    node = curNode
  }
  return node
}

test('Stylesheet with simple rules', function (t) {
  const s = new Stylesheet()
  s.addRule('View', {props: {prop1: 1, prop2: 2}})
  t.deepEqual(s.getProps(nodeFromPath(s, 'View')), { prop1: 1, prop2: 2 }, 'getProps correct')
  t.deepEqual(s.getProps(nodeFromPath(s, 'View')), { prop1: 1, prop2: 2 }, 'getProps cached result')
  t.deepEqual(s.getProps(nodeFromPath(s, 'Text')), {}, 'getProps not in style sheet')
  t.deepEqual(s.getProps(nodeFromPath(s, 'View', { prop1: 11, prop3: 31 })), {
    prop1: 11,
    prop2: 2,
    prop3: 31
  }, 'with own props')
  t.end()
})

test('Stylesheet with inherited rules', function (t) {
  const s = new Stylesheet()
  s.addRule('View', {props: {p1: 1, p2: 2}})
  s.addRule('App View', {props: {p1: 11, p3: 3}})
  t.deepEqual(s.getProps(nodeFromPath(s, 'View')), {p1: 1, p2: 2}, 'getProps context:[View]')
  t.deepEqual(s.getProps(nodeFromPath(s, 'Other View')), {p1: 1, p2: 2}, 'getProps context:[Other View]')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App View')), {p1: 11, p2: 2, p3: 3}, 'getProps context:[App View]')
  t.deepEqual(s.getProps(nodeFromPath(s, 'Other App Other View')), {p1: 11, p2: 2, p3: 3}, 'getProps context:[Other App Other View]')
  t.end()
})

test('Default rules', function (t) {
  const s = new Stylesheet()
  s.addDefaultRule('App View', {props: {p1: 1, p2: 1}})
  s.addRule('View', {props: {p2: 2, p3: 2}})
  t.deepEqual(s.getProps(nodeFromPath(s, 'App View')), {p1: 1, p2: 2, p3: 2}, 'getProps context:[App View]')
  t.end()
})

test('Overlapping rules', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'View': {props: {d: 1}},
    'App View': {props: {d: 2}}
  })
  s.addRules({
    'View': {props: {p1: 1, p2: 2}},
    'App View': {props: {p1: 11, p3: 3}}
  })
  t.deepEqual(s.getProps(nodeFromPath(s, 'Other Other2 View')), {d: 1, p1: 1, p2: 2}, 'getProps context:[Other Other2 View]')
  t.deepEqual(s.getProps(nodeFromPath(s, 'Other App Other View')), {d: 2, p1: 11, p2: 2, p3: 3}, 'getProps context:[Other App Other View]')
  t.end()
})

test('Rules priority', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Text': {style: {fontSize: 1}},
    'Button Text': {style: {fontSize: 2}},
    'Title Text': {style: {fontSize: 3}},
    'App Button Text': {style: {fontSize: 4}},
    'App Title Text': {style: {fontSize: 5}},
    'App Button.active Text': {style: {fontSize: 6}}
  })
  t.deepEqual(nodeFromPath(s, 'App Other Text').getChildProps(), {style: {fontSize: 1}})
  t.deepEqual(nodeFromPath(s, 'Other Button Text').getChildProps(), {style: {fontSize: 2}})
  t.deepEqual(nodeFromPath(s, 'Other1 Other2 Title Other3 Other4 Text').getChildProps(), {style: {fontSize: 3}})
  t.deepEqual(nodeFromPath(s, 'App Button Text').getChildProps(), {style: {fontSize: 4}})
  t.deepEqual(nodeFromPath(s, 'App Title Text').getChildProps(), {style: {fontSize: 5}})
  t.deepEqual(nodeFromPath(s, 'App Button.active Text').getChildProps(), {style: {fontSize: 6}})
  t.end()
})

test('Style property', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Text': {style: {fontSize: 8, color: 'black'}},
    'App Text': {style: {fontSize: 10}}
  })
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Other Text')), {
    style: {
      fontSize: 10,
      color: 'black'
    }
  }, 'get correct fontSize')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Other Text', {style: {color: 'green'}})), {
    style: [{ fontSize: 10, color: 'black' }, { color: 'green' }]
  }, 'own style is object')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Other Text', {style: 2})), {
    style: [{ fontSize: 10, color: 'black' }, 2]
  }, 'own style is number')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Other Text', {style: [2]})), {
    style: [{ fontSize: 10, color: 'black' }, 2]
  }, 'own style is array')
  t.end()
})

test('mixins', function (t) {
  const s = new Stylesheet()
  s.addRules({
    'bold': {mixins: ['defaultFont'], style: {fontWeight: 'bold'}},
    'defaultFont': {style: {fontSize: 10, fontFamily: 'Helvetica'}},
    'Intro defaultFont': {style: {fontSize: 20}},
    'Text2': {mixins: ['bold']}
  })
  s.addDefaultRules({
    'Text': {mixins: ['defaultFont'], style: {horizontalMargin: 2}}
  })
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Text')), {
    style: {
      fontSize: 10,
      fontFamily: 'Helvetica',
      horizontalMargin: 2
    }
  }, 'get props from mixin')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Text2')), {
    style: { fontSize: 10, fontFamily: 'Helvetica', fontWeight: 'bold' }
  }, 'mixins in mixins')
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Intro Text')), {
    style: { fontSize: 20, fontFamily: 'Helvetica', horizontalMargin: 2 }
  }, 'in context')
  t.end()
})

test('mixins. can update rules', function (t) {
  const s = new Stylesheet()
  s.addRules({
    'defaultFont': {style: {fontSize: 10, fontFamily: 'Helvetica'}},
    'Intro defaultFont': {style: {fontSize: 20}}
  })
  s.addDefaultRules({
    'Text': {mixins: ['defaultFont'], style: {horizontalMargin: 2}}
  })
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Text')), {
    style: { fontSize: 10, fontFamily: 'Helvetica', horizontalMargin: 2 }
  })
  s.addRules({
    'defaultFont': {style: {fontSize: 8}}
  })
  t.deepEqual(s.getProps(nodeFromPath(s, 'App Text')), {
    style: { fontSize: 8, horizontalMargin: 2 }
  })
  t.end()
})

test('variants', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Header': {style: {fontSize: 10}},
    'Header.active': {style: {fontWeight: 'bold'}}
  })
  s.addDefaultRules({
    'Button Text': {style: {color: 'blue'}},
    'Button.active Text': {style: {fontWeight: 'bold'}}
  })
  t.deepEqual(nodeFromPath(s, 'App Header', {variant: 'active'}).getChildProps(), {
    style: {fontSize: 10, fontWeight: 'bold'}
  }, 'with variant')
  t.deepEqual(nodeFromPath(s, 'App Header', {}).getChildProps(), {
    style: {fontSize: 10}
  }, 'without variant')
  t.deepEqual(nodeFromPath(s, 'Button.active Text').getChildProps(), {
    style: {color: 'blue', fontWeight: 'bold'}
  }, 'with parent variant')
  t.end()
})
