/* eslint-env jest */

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

function getPropsForNode (s, fullPath, ownProps) {
  const n = nodeFromPath(s, fullPath, ownProps)
  return s.getProps(n)
}

test('Stylesheet with simple rules', function () {
  const s = new Stylesheet()
  s.addRule('View', {props: {prop1: 1, prop2: 2}})
  expect(getPropsForNode(s, 'View')).toEqual({prop1: 1, prop2: 2})
  expect(getPropsForNode(s, 'View')).toEqual({prop1: 1, prop2: 2})
  expect(getPropsForNode(s, 'Text')).toEqual({})
  expect(getPropsForNode(s, 'View', { prop1: 11, prop3: 31 })).toEqual({
    prop1: 11,
    prop2: 2,
    prop3: 31
  })
})

test('Stylesheet with inherited rules', function () {
  const s = new Stylesheet()
  s.addRule('View', {props: {p1: 1, p2: 2}})
  s.addRule('App View', {props: {p1: 11, p3: 3}})

  expect(s.getProps(nodeFromPath(s, 'View'))).toEqual({p1: 1, p2: 2})
  expect(s.getProps(nodeFromPath(s, 'Other View'))).toEqual({p1: 1, p2: 2})
  expect(s.getProps(nodeFromPath(s, 'App View'))).toEqual({p1: 11, p2: 2, p3: 3})
  expect(s.getProps(nodeFromPath(s, 'Other App Other View'))).toEqual({p1: 11, p2: 2, p3: 3})
})

test('Default rules', function () {
  const s = new Stylesheet()
  s.addDefaultRule('App View', {props: {p1: 1, p2: 1}})
  s.addRule('View', {props: {p2: 2, p3: 2}})
  expect(getPropsForNode(s, 'App View')).toEqual({p1: 1, p2: 2, p3: 2})
})

test('Overlapping rules', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'View': {props: {d: 1}},
    'App View': {props: {d: 2}}
  })
  s.addRules({
    'View': {props: {p1: 1, p2: 2}},
    'App View': {props: {p1: 11, p3: 3}}
  })
  expect(s.getProps(nodeFromPath(s, 'Other Other2 View'))).toEqual({d: 1, p1: 1, p2: 2})
  expect(s.getProps(nodeFromPath(s, 'Other App Other View'))).toEqual({d: 2, p1: 11, p2: 2, p3: 3})
})

test('Rules priority', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Text': {style: {fontSize: 1}},
    'Button Text': {style: {fontSize: 2}},
    'Title Text': {style: {fontSize: 3}},
    'App Button Text': {style: {fontSize: 4}},
    'App Title Text': {style: {fontSize: 5}},
    'App Button.active Text': {style: {fontSize: 6}}
  })
  expect(nodeFromPath(s, 'App Other Text').getChildProps()).toEqual({style: {fontSize: 1}})
  expect(nodeFromPath(s, 'Other Button Text').getChildProps()).toEqual({style: {fontSize: 2}})
  expect(nodeFromPath(s, 'Other1 Other2 Title Other3 Other4 Text').getChildProps()).toEqual({style: {fontSize: 3}})
  expect(nodeFromPath(s, 'App Button Text').getChildProps()).toEqual({style: {fontSize: 4}})
  expect(nodeFromPath(s, 'App Title Text').getChildProps()).toEqual({style: {fontSize: 5}})
  expect(nodeFromPath(s, 'App Button.active Text').getChildProps()).toEqual({style: {fontSize: 6}})
})

test('Style property', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Text': {style: {fontSize: 8, color: 'black'}},
    'App Text': {style: {fontSize: 10}}
  })
  expect(s.getProps(nodeFromPath(s, 'App Other Text')), {
    style: {
      fontSize: 10,
      color: 'black'
    }
  }, 'get correct fontSize')
  expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: {color: 'green'}}))).toEqual({
    style: [{ fontSize: 10, color: 'black' }, { color: 'green' }]
  })
  expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: 2}))).toEqual({
    style: [{ fontSize: 10, color: 'black' }, 2]
  })
  expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: [2]}))).toEqual({
    style: [{ fontSize: 10, color: 'black' }, 2]
  })
})

test('mixins', function () {
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
  expect(s.getProps(nodeFromPath(s, 'App Text'))).toEqual({
    style: {
      fontSize: 10,
      fontFamily: 'Helvetica',
      horizontalMargin: 2
    }
  })
  expect(s.getProps(nodeFromPath(s, 'App Text2'))).toEqual({
    style: { fontSize: 10, fontFamily: 'Helvetica', fontWeight: 'bold' }
  })
  expect(s.getProps(nodeFromPath(s, 'App Intro Text'))).toEqual({
    style: { fontSize: 20, fontFamily: 'Helvetica', horizontalMargin: 2 }
  })
})

test('mixins. can update rules', function () {
  const s = new Stylesheet()
  s.addRules({
    'defaultFont': {style: {fontSize: 10, fontFamily: 'Helvetica'}},
    'Intro defaultFont': {style: {fontSize: 20}}
  })
  s.addDefaultRules({
    'Text': {mixins: ['defaultFont'], style: {horizontalMargin: 2}}
  })
  expect(s.getProps(nodeFromPath(s, 'App Text'))).toEqual({
    style: { fontSize: 10, fontFamily: 'Helvetica', horizontalMargin: 2 }
  })
  s.addRules({
    'defaultFont': {style: {fontSize: 8}}
  })
  expect(s.getProps(nodeFromPath(s, 'App Text'))).toEqual({
    style: { fontSize: 8, horizontalMargin: 2 }
  })
})

test('variants', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Header': {style: {fontSize: 10}},
    'Header.active': {style: {fontWeight: 'bold'}}
  })
  s.addDefaultRules({
    'Button Text': {style: {color: 'blue'}},
    'Button.active Text': {style: {fontWeight: 'bold'}}
  })
  expect(nodeFromPath(s, 'App Header', {variant: 'active'}).getChildProps()).toEqual({
    style: {fontSize: 10, fontWeight: 'bold'}
  })
  expect(nodeFromPath(s, 'App Header', {}).getChildProps()).toEqual({
    style: {fontSize: 10}
  })
  expect(nodeFromPath(s, 'Button.active Text').getChildProps()).toEqual({
    style: {color: 'blue', fontWeight: 'bold'}
  })
})
