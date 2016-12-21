/* eslint-env mocha */

import { expect } from 'chai'

import { parseSelector } from '../src/selectors'

describe('Selectors', function () {
  describe('simple', function () {
    let s
    describe('El', function () {
      beforeEach(function () {
        s = parseSelector('El')
      })
      it('parsed correctly', function () {
        expect(s.getName()).to.equal('El')
      })
      it('specificity', function () {
        expect(s.getSpecificity()).to.equal(1)
      })
      it('stringify', function () {
        expect(s.toString()).to.equal('El')
      })
    })
    describe('El.one', function () {
      beforeEach(function () {
        s = parseSelector('El.one')
      })
      it('parsed correctly', function () {
        expect(s.getName()).to.equal('El')
      })
      it('specificity', function () {
        expect(s.getSpecificity()).to.equal((1 << 8) + 1)
      })
      it('stringify', function () {
        expect(s.toString()).to.equal('El.one')
      })
    })
    describe('El.one.two', function () {
      beforeEach(function () {
        s = parseSelector('El.one.two')
      })
      it('parsed correctly', function () {
        expect(s.getName()).to.equal('El')
      })
      it('specificity', function () {
        expect(s.getSpecificity()).to.equal((2 << 8) + 1)
      })
      it('stringify', function () {
        expect(s.toString()).to.equal('El.one.two')
      })
    })
  })
  describe('compaund', function () {
    let s
    describe('App View Text', function () {
      beforeEach(function () {
        s = parseSelector('App View Text')
      })
      it('parsed correctly', function () {
        expect(s.getName()).to.equal('Text')
      })
      it('specificity', function () {
        expect(s.getSpecificity()).to.equal(3)
      })
      it('stringify', function () {
        expect(s.toString()).to.equal('App View Text')
      })
    })
    describe('App View.one Text', function () {
      beforeEach(function () {
        s = parseSelector('App View.one Text')
      })
      it('parsed correctly', function () {
        expect(s.getName()).to.equal('Text')
      })
      it('specificity', function () {
        expect(s.getSpecificity()).to.equal((1 << 8) + 3)
      })
      it('stringify', function () {
        expect(s.toString()).to.equal('App View.one Text')
      })
    })
  })
})
