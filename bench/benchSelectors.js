
import Stylesheet from '../src/stylesheet'
import Node from '../src/node'
import { parseSelector } from '../src/selectors'

const s = new Stylesheet()

const appNode = new Node('App', {}, undefined, s)
const appViewNode = new Node('AppView', {}, appNode, s)
const elemNode = new Node('Elem', {variant: ['selected']}, appViewNode, s)
const itemNode = new Node('Item', {}, elemNode, s)
const textNode = new Node('Text', {prop1: 1}, itemNode, s)

function createBenchFunc (sel, node, expected) {
  return function () {
    const actual = sel.matchContext(node)
    if (actual !== expected) {
      throw new Error(`expected ${expected} but got ${actual}`)
    }
  }
}

export default [
  {
    name: 'selectors: simple match',
    fn: createBenchFunc(parseSelector('Text'), textNode, true)
  },
  {
    name: 'selectors: simple not match',
    fn: createBenchFunc(parseSelector('NotExists'), textNode, false)
  },
  {
    name: 'selectors: complex match',
    fn: createBenchFunc(parseSelector('AppView Elem.selected Text'), textNode, true)
  },
  {
    name: 'selectors: complex not match',
    fn: createBenchFunc(parseSelector('NotExists Elem Text'), textNode, false)
  }
]
