/* eslint-env mocha */

import { expect } from 'chai'

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

describe('Stylesheet', function () {
  let s
  beforeEach(function () {
    s = new Stylesheet()
  })
  describe('Simple rule', function () {
    beforeEach(function () {
      s.addRule('View', {props: {prop1: 1, prop2: 2}})
    })
    it('getProps for styled object', function () {
      expect(s.getProps(nodeFromPath(s, 'View'))).to.be.deep.equal({ prop1: 1, prop2: 2 })
      // cache works
      expect(s.getProps(nodeFromPath(s, 'View'))).to.be.deep.equal({ prop1: 1, prop2: 2 })
    })
    it('getProps for unstyled object', function () {
      expect(s.getProps(nodeFromPath(s, 'Text'))).to.be.deep.equal({})
    })
    it('getProps with own properties', function () {
      expect(s.getProps(nodeFromPath(s, 'View', { prop1: 11, prop3: 31 }))).to.be.deep.equal({
        prop1: 11,
        prop2: 2,
        prop3: 31
      })
    })
  })
  describe('Inherited rule', function () {
    beforeEach(function () {
      s.addRule('View', {props: {p1: 1, p2: 2}})
      s.addRule('App View', {props: {p1: 11, p3: 3}})
    })
    it('getProps context:[View]', function () {
      expect(s.getProps(nodeFromPath(s, 'View'))).to.be.deep.equal({p1: 1, p2: 2})
    })
    it('getProps context:[Other View]', function () {
      expect(s.getProps(nodeFromPath(s, 'Other View'))).to.be.deep.equal({p1: 1, p2: 2})
    })
    it('getProps context:[App View]', function () {
      expect(s.getProps(nodeFromPath(s, 'App View'))).to.be.deep.equal({p1: 11, p2: 2, p3: 3})
    })
    it('getProps context:[Other App Other View]', function () {
      expect(s.getProps(nodeFromPath(s, 'Other App Other View'))).to.be.deep.equal({p1: 11, p2: 2, p3: 3})
    })
  })
  describe('Default rules', function () {
    beforeEach(function () {
      s.addDefaultRule('App View', {props: {p1: 1, p2: 1}})
      s.addRule('View', {props: {p2: 2, p3: 2}})
    })
    it('getProps context:[App View]', function () {
      expect(s.getProps(nodeFromPath(s, 'App View'))).to.be.deep.equal({p1: 1, p2: 2, p3: 2})
    })
  })
  describe('Many rules', function () {
    beforeEach(function () {
      s.addDefaultRules({
        'View': {props: {d: 1}},
        'App View': {props: {d: 2}}
      })
      s.addRules({
        'View': {props: {p1: 1, p2: 2}},
        'App View': {props: {p1: 11, p3: 3}}
      })
    })
    it('getProps context:[Other Other2 View]', function () {
      expect(s.getProps(nodeFromPath(s, 'Other Other2 View'))).to.be.deep.equal({d: 1, p1: 1, p2: 2})
    })
    it('getProps context:[Other App Other View]', function () {
      expect(s.getProps(nodeFromPath(s, 'Other App Other View'))).to.be.deep.equal({d: 2, p1: 11, p2: 2, p3: 3})
    })
  })
  describe('Style property', function () {
    beforeEach(function () {
      s.addDefaultRules({
        'Text': {style: {fontSize: 8, color: 'black'}},
        'App Text': {style: {fontSize: 10}}
      })
    })
    it('get correct fontSize', function () {
      expect(s.getProps(nodeFromPath(s, 'App Other Text'))).to.be.deep.equal({
        style: {
          fontSize: 10,
          color: 'black'
        }
      })
    })
    describe('with ownStyle', function () {
      it('Object', function () {
        expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: {color: 'green'}}))).to.be.deep.equal({
          style: [{ fontSize: 10, color: 'black' }, { color: 'green' }]
        })
      })
      it('Number', function () {
        expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: 2}))).to.be.deep.equal({
          style: [{ fontSize: 10, color: 'black' }, 2]
        })
      })
      it('Array', function () {
        expect(s.getProps(nodeFromPath(s, 'App Other Text', {style: [2]}))).to.be.deep.equal({
          style: [{ fontSize: 10, color: 'black' }, 2]
        })
      })
    })
  })
  describe('mixins', function () {
    beforeEach(function () {
      s.addRules({
        'defaultFont': {style: {fontSize: 10, fontFamily: 'Helvetica'}},
        'Intro defaultFont': {style: {fontSize: 20}}
      })
      s.addDefaultRules({
        'Text': {mixins: ['defaultFont'], style: {horizontalMargin: 2}}
      })
    })
    it('get props from mixin', function () {
      expect(s.getProps(nodeFromPath(s, 'App Text'))).to.be.deep.equal({
        style: {
          fontSize: 10,
          fontFamily: 'Helvetica',
          horizontalMargin: 2
        }
      })
    })
    it('can update rules', function () {
      expect(s.getProps(nodeFromPath(s, 'App Text'))).to.be.deep.equal({
        style: { fontSize: 10, fontFamily: 'Helvetica', horizontalMargin: 2 }
      })
      s.addRules({
        'defaultFont': {style: {fontSize: 8}}
      })
      expect(s.getProps(nodeFromPath(s, 'App Text'))).to.be.deep.equal({
        style: { fontSize: 8, horizontalMargin: 2 }
      })
    })
    it('mixins in mixins', function () {
      s.addRules({
        'bold': {mixins: ['defaultFont'], style: {fontWeight: 'bold'}},
        'Text2': {mixins: ['bold']}
      })
      expect(s.getProps(nodeFromPath(s, 'App Text2'))).to.be.deep.equal({
        style: { fontSize: 10, fontFamily: 'Helvetica', fontWeight: 'bold' }
      })
    })
    it('in context', function () {
      expect(s.getProps(nodeFromPath(s, 'App Intro Text'))).to.be.deep.equal({
        style: { fontSize: 20, fontFamily: 'Helvetica', horizontalMargin: 2 }
      })
    })
  })
  describe('variants', function () {
    beforeEach(function () {
      s.addDefaultRules({
        'Header': {style: {fontSize: 10}},
        'Header.active': {style: {fontWeight: 'bold'}}
      })
      s.addDefaultRules({
        'Button Text': {style: {color: 'blue'}},
        'Button.active Text': {style: {fontWeight: 'bold'}}
      })
    })
    it('follow variants', function () {
      expect(nodeFromPath(s, 'App Header', {variant: 'active'}).childProps).to.be.deep.equal({
        style: {fontSize: 10, fontWeight: 'bold'}
      })
      expect(nodeFromPath(s, 'App Header', {}).childProps).to.be.deep.equal({
        style: {fontSize: 10}
      })
    })
    it.skip('follow parent variants', function () {
      expect(nodeFromPath(s, 'Button.active Text').childProps).to.be.deep.equal({
        style: {color: 'blue', fontWeight: 'bold'}
      })
    })
  })
})
