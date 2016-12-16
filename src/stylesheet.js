
class Selector {
  constructor (value) {
    const chains = value.split(/\s+/)
    const chainsCount = chains.length
    this.value = value
    this.chains = chains
    this.name = chains[chainsCount - 1]
    this.order = chainsCount
  }
  getName () { return this.name }
  getOrder () { return this.order }
  getValue () { return this.value }
  matchContext (name, context) {
    if (this.name !== name) return false
    if (this.order === 1) return true // simple rule
    if (context !== undefined) {
      let j = this.order - 1
      let i = context.length - 1
      const chains = this.chains
      while (i >= 0 && j > 0) {
        if (chains[j - 1] === context[i]) --j
        --i
      }
      if (j === 0) return true
    }
    return false
  }
}

class SimpleSelector {
  constructor (value) {
    this.value = value
  }
  getName () { return this.value }
  getOrder () { return 1 }
  getValue () { return this.value }
  matchContext (name, context) {
    return name === this.value
  }
}

class Rule {
  constructor (selector, props, rank) {
    this.selector = selector
    this.rank = rank
    this.props = props.props
    this.style = props.style
    this.mixins = props.mixins
    this.resolvedProps = undefined
    this.resolvedStyle = undefined
    this.resolveGen = 0
  }
  getKey () { return this.selector.getName() }
  getSelector () { return this.selector.getValue() }
  getRank () { return this.rank }
  getOrder () { return this.selector.getOrder() }
  matchContext (name, context) { return this.selector.matchContext(name, context) }
  resolve (s) {
    if (this.resolveGen !== s.ngen) {
      this.doResolution(s)
      this.resolveGen = s.ngen
    }
    return {
      props: this.resolvedProps,
      style: this.resolvedStyle
    }
  }
  doResolution (s) {
    if (this.mixins === undefined) {
      this.resolvedProps = this.props
      this.resolvedStyle = this.style
      return
    }
    // reset
    let props
    let style
    if (this.props !== undefined) {
      props = {}
      mergeTo(props, this.props)
    }
    if (this.style !== undefined) {
      style = {}
      mergeTo(style, this.style)
    }
    for (let k in this.mixins) {
      const rules = s.getRules(this.mixins[k])
      for (let i in rules) {
        const rule = rules[i]
        const data = rule.resolve(s)
        if (data.props !== undefined) {
          if (props === undefined) props = {}
          mergeTo(props, data.props)
        }
        if (data.style !== undefined) {
          if (style === undefined) style = {}
          mergeTo(style, data.style)
        }
      }
    }
    this.resolvedProps = props
    this.resolvedStyle = style
  }
}

function ruleComparator (r1, r2) {
  const cmp = r2.getRank() - r1.getRank()
  if (cmp === 0) return r2.getOrder() - r1.getOrder()
  return cmp
}

function mergeTo (target, source) {
  for (let k in source) {
    if (!target.hasOwnProperty(k)) target[k] = source[k]
  }
}

function parseContext (context) {
  const spaceIdx = context.lastIndexOf(' ')
  if (spaceIdx === -1) {
    return {name: context, rest: undefined}
  }
  const name = context.slice(spaceIdx + 1)
  const rest = context.slice(0, spaceIdx).split(' ')
  return {name, rest}
}

function mergeToProps (target, props, style) {
  const ret = {}
  if (target !== undefined) {
    for (let k in target) {
      ret[k] = target[k]
    }
  }
  if (props !== undefined) {
    mergeTo(ret, props)
  }
  if (style !== undefined) {
    if (ret.style === undefined) ret.style = {}
    mergeTo(ret.style, style)
  }
  return ret
}

class Stylesheet {
  constructor () {
    this.rules = {}
    this.ngen = 0
  }
  addDefaultRules (rules) {
    for (let selector in rules) {
      this._addRule(selector, rules[selector], 0)
    }
    this._resetCache()
  }
  addRules (rules) {
    for (let selector in rules) {
      this._addRule(selector, rules[selector], 1)
    }
    this._resetCache()
  }
  addDefaultRule (selector, props) {
    this._addRule(selector, props, 0)
    this._resetCache()
  }
  addRule (selector, props) {
    this._addRule(selector, props, 1)
    this._resetCache()
  }
  _addRule (selectorValue, props, rank) {
    let selector
    if (selectorValue.indexOf(' ') === -1) {
      selector = new SimpleSelector(selectorValue)
    } else {
      selector = new Selector(selectorValue)
    }
    const rule = new Rule(selector, props, rank)
    const key = rule.getKey()
    if (this.rules[key] === undefined) {
      this.rules[key] = [rule]
    } else {
      const rules = this.rules[key]
      const i = rules.findIndex(el => rule.getSelector() === el.getSelector() && rule.getRank() === el.getRank())
      if (i >= 0) {
        rules[i] = rule
      } else {
        rules.push(rule)
      }
    }
    this.rules[key].sort(ruleComparator)
  }
  getProps (context, ownProps) {
    const data = this._resolve(context)
    return mergeToProps(ownProps, data.props, data.style)
  }
  getRules (name) {
    const ret = []
    if (this.rules[name] !== undefined) {
      const rules = this.rules[name]
      for (let i in rules) {
        const rule = rules[i]
        if (rule.matchContext(name)) {
          ret.push(rule)
        }
      }
    }
    return ret
  }
  _resolve (context) {
    const ctx = parseContext(context)
    let props, style
    if (this.rules[ctx.name] !== undefined) {
      const rules = this.rules[ctx.name]
      for (let i in rules) {
        const rule = rules[i]
        if (rule.matchContext(ctx.name, ctx.rest)) {
          const data = rule.resolve(this)
          if (data.props !== undefined) {
            if (props === undefined) props = {}
            mergeTo(props, data.props)
          }
          if (data.style !== undefined) {
            if (style === undefined) style = {}
            mergeTo(style, data.style)
          }
        }
      }
    }
    return {props, style}
  }
  _resetCache () {
    this.ngen++
  }
}

export default Stylesheet
