/* eslint-env mocha */

import { expect } from 'chai'

import Stylesheet from '../src/stylesheet'

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
      expect(s.getProps('View')).to.be.deep.equal({ prop1: 1, prop2: 2 })
      // cache works
      expect(s.getProps('View')).to.be.deep.equal({ prop1: 1, prop2: 2 })
    })
    it('getProps for unstyled object', function () {
      expect(s.getProps('Text')).to.be.deep.equal({})
    })
    it('getProps with own properties', function () {
      expect(s.getProps('View', { prop1: 11, prop3: 31 })).to.be.deep.equal({
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
      expect(s.getProps('View')).to.be.deep.equal({p1: 1, p2: 2})
    })
    it('getProps context:[Other View]', function () {
      expect(s.getProps('Other View')).to.be.deep.equal({p1: 1, p2: 2})
    })
    it('getProps context:[App View]', function () {
      expect(s.getProps('App View')).to.be.deep.equal({p1: 11, p2: 2, p3: 3})
    })
    it('getProps context:[Other App Other View]', function () {
      expect(s.getProps('Other App Other View')).to.be.deep.equal({p1: 11, p2: 2, p3: 3})
    })
  })
  describe('Default rules', function () {
    beforeEach(function () {
      s.addDefaultRule('App View', {props: {p1: 1, p2: 1}})
      s.addRule('View', {props: {p2: 2, p3: 2}})
    })
    it('getProps context:[App View]', function () {
      expect(s.getProps('App View')).to.be.deep.equal({p1: 1, p2: 2, p3: 2})
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
      expect(s.getProps('Other Other2 View')).to.be.deep.equal({d: 1, p1: 1, p2: 2})
    })
    it('getProps context:[Other App Other View]', function () {
      expect(s.getProps('Other App Other View')).to.be.deep.equal({d: 2, p1: 11, p2: 2, p3: 3})
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
      expect(s.getProps('App Other Text')).to.be.deep.equal({
        style: {
          fontSize: 10,
          color: 'black'
        }
      })
    })
    it('get correct style with ownStyle', function () {
      expect(s.getProps('App Other Text', {style: {color: 'green'}})).to.be.deep.equal({
        style: {
          fontSize: 10,
          color: 'green'
        }
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
      expect(s.getProps('App Text')).to.be.deep.equal({
        style: {
          fontSize: 10,
          fontFamily: 'Helvetica',
          horizontalMargin: 2
        }
      })
    })
    it('can update rules', function () {
      expect(s.getProps('App Text')).to.be.deep.equal({
        style: { fontSize: 10, fontFamily: 'Helvetica', horizontalMargin: 2 }
      })
      s.addRules({
        'defaultFont': {style: {fontSize: 8}}
      })
      expect(s.getProps('App Text')).to.be.deep.equal({
        style: { fontSize: 8, horizontalMargin: 2 }
      })
    })
    it('mixins in mixins', function () {
      s.addRules({
        'bold': {mixins: ['defaultFont'], style: {fontWeight: 'bold'}},
        'Text2': {mixins: ['bold']}
      })
      expect(s.getProps('App Text2')).to.be.deep.equal({
        style: { fontSize: 10, fontFamily: 'Helvetica', fontWeight: 'bold' }
      })
    })
    it('in context', function () {
      expect(s.getProps('App Intro Text')).to.be.deep.equal({
        style: { fontSize: 20, fontFamily: 'Helvetica', horizontalMargin: 2 }
      })
    })
  })
})
