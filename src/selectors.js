export class Selector {
  constructor () {
    this.subSelectors = []
    this.name = undefined
    this.specificity = 0
  }
  addSimpleSelector (sel) {
    this.subSelectors.push(sel)
    this.name = sel.getName()
    // specificity
    let specificity = 0
    for (let i = 0; i < this.subSelectors.length; ++i) specificity += this.subSelectors[i].getSpecificity()
    this.specificity = specificity
  }
  getName () { return this.name }
  getSpecificity () { return this.specificity }
  matchContext (node) {
    let curNode = node
    if (curNode !== undefined) {
      const subSelectors = this.subSelectors
      let j = subSelectors.length - 1
      while (curNode && j >= 0) {
        if (subSelectors[j].matchContext(curNode)) --j
        curNode = curNode.parent
      }
      if (j === -1) return true
    }
    return false
  }
  toString () {
    return this.subSelectors.map(s => s.toString()).join(' ')
  }
}

export class SimpleSelector {
  constructor (name, variants) {
    this.name = name
    this.variants = variants
    // specificity
    const sc = variants === undefined ? 0 : variants.length
    const sd = 1
    this.specificity = (sc << 8) + sd
  }
  getName () { return this.name }
  getSpecificity () { return this.specificity }
  matchContext (node) {
    if (this.name !== node.getName()) return false
    if (this.variants !== undefined) {
      const nodeVariants = node.getVariants()
      if (nodeVariants === undefined) return false
      if (typeof nodeVariants === 'string') {
        if (this.variants.length !== 1) return false
        if (this.variants[0] !== nodeVariants) return false
      } else {
        for (let i = 0; i < this.variants.length; ++i) {
          if (!nodeVariants.includes(this.variants[i])) return false
        }
      }
    }
    return true
  }
  toString () {
    if (this.variants === undefined) {
      return this.name
    } else {
      return this.name + '.' + this.variants.join('.')
    }
  }
}

export function parseSelector (value) {
  if (value.indexOf(' ') === -1) {
    return parseSimpleSelector(value)
  } else {
    return parseCompoundSelector(value)
  }
}

function parseSimpleSelector (value) {
  let dotPos = value.indexOf('.')
  if (dotPos === -1) {
    return new SimpleSelector(value)
  } else {
    return new SimpleSelector(value.slice(0, dotPos), value.slice(dotPos + 1).split('.'))
  }
}

function parseCompoundSelector (value) {
  const s = new Selector()
  const chunks = value.split(/\s+/)
  for (let i = 0; i < chunks.length; ++i) {
    s.addSimpleSelector(parseSimpleSelector(chunks[i]))
  }
  return s
}
