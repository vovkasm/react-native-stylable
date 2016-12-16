
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
  }
  getKey () { return this.selector.getName() }
  getSelector () { return this.selector.getValue() }
  getRank () { return this.rank }
  getOrder () { return this.selector.getOrder() }
  matchContext (name, context) { return this.selector.matchContext(name, context) }
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

function shallowClone (props) {
  const ret = {}
  if (props !== undefined) {
    for (let k in props) {
      ret[k] = props[k]
    }
  }
  return ret
}

function parseContext (context) {
  const spaceIdx = context.lastIndexOf(' ')
  if (spaceIdx === -1) {
    return makeRuleCtx(context, undefined)
  }
  const name = context.slice(spaceIdx + 1)
  const rest = context.slice(0, spaceIdx).split(' ')
  return makeRuleCtx(name, rest)
}

function makeRuleCtx (name, rest) {
  return { name, rest }
}

class Stylesheet {
  constructor () {
    this.rules = {}
  }
  addDefaultRules (rules) {
    for (let selector in rules) {
      this._addRule(selector, rules[selector], 0)
    }
  }
  addRules (rules) {
    for (let selector in rules) {
      this._addRule(selector, rules[selector], 1)
    }
  }
  addDefaultRule (selector, props) {
    this._addRule(selector, props, 0)
  }
  addRule (selector, props) {
    this._addRule(selector, props, 1)
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
    const props = shallowClone(ownProps)

    const ctx = parseContext(context)
    const rules = []
    this.collectRules(rules, ctx)
    for (let i in rules) {
      const rule = rules[i]
      if (rule.props !== undefined) {
        mergeTo(props, rule.props)
      }
      if (rule.style !== undefined) {
        if (props.style === undefined) props.style = {}
        mergeTo(props.style, rule.style)
      }
    }
    return props
  }
  collectRules (target, ctx) {
    if (this.rules[ctx.name] !== undefined) {
      const rules = this.rules[ctx.name]
      for (let i in rules) {
        const rule = rules[i]
        if (rule.matchContext(ctx.name, ctx.rest)) {
          target.push(rule)
          if (rule.mixins !== undefined) {
            for (let j = 0; j < rule.mixins.length; ++j) {
              this.collectRules(target, makeRuleCtx(rule.mixins[j], ctx.rest))
            }
          }
        }
      }
    }
  }
}

export default Stylesheet
