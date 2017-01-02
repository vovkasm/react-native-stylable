import test from 'tape'

import { parseSelector } from '../src/selectors'

test('Selector: El', function (t) {
  const s = parseSelector('El')
  t.is(s.getName(), 'El')
  t.is(s.getSpecificity(), 1)
  t.is(s.toString(), 'El')
  t.end()
})
test('Selector: El.one', function (t) {
  const s = parseSelector('El.one')
  t.is(s.getName(), 'El')
  t.is(s.getSpecificity(), (1 << 8) + 1)
  t.is(s.toString(), 'El.one')
  t.end()
})
test('Selector: El.one.two', function (t) {
  const s = parseSelector('El.one.two')
  t.is(s.getName(), 'El')
  t.is(s.getSpecificity(), (2 << 8) + 1)
  t.is(s.toString(), 'El.one.two')
  t.end()
})
test('Selector: App View Text', function (t) {
  const s = parseSelector('App View Text')
  t.is(s.getName(), 'Text')
  t.is(s.getSpecificity(), 3)
  t.is(s.toString(), 'App View Text')
  t.end()
})
test('Selector: App View.one Text', function (t) {
  const s = parseSelector('App View.one Text')
  t.is(s.getName(), 'Text')
  t.is(s.getSpecificity(), (1 << 8) + 3)
  t.is(s.toString(), 'App View.one Text')
  t.end()
})
