/* eslint-env jest */

import { parseSelector } from '../src/selectors'

test('Selector: El', function () {
  const s = parseSelector('El')
  expect(s.getName()).toBe('El')
  expect(s.getSpecificity()).toBe(1)
  expect(s.toString()).toBe('El')
})
test('Selector: El.one', function () {
  const s = parseSelector('El.one')
  expect(s.getName()).toBe('El')
  expect(s.getSpecificity()).toBe((1 << 8) + 1)
  expect(s.toString()).toBe('El.one')
})
test('Selector: El.one.two', function () {
  const s = parseSelector('El.one.two')
  expect(s.getName()).toBe('El')
  expect(s.getSpecificity()).toBe((2 << 8) + 1)
  expect(s.toString()).toBe('El.one.two')
})
test('Selector: App View Text', function () {
  const s = parseSelector('App View Text')
  expect(s.getName()).toBe('Text')
  expect(s.getSpecificity()).toBe(3)
  expect(s.toString()).toBe('App View Text')
})
test('Selector: App View.one Text', function () {
  const s = parseSelector('App View.one Text')
  expect(s.getName()).toBe('Text')
  expect(s.getSpecificity()).toBe((1 << 8) + 3)
  expect(s.toString()).toBe('App View.one Text')
})
