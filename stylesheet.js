
class Rule {
  constructor (selector, props, rank) {
    this.selector = selector
    this.chains = selector.split(/\s+/)
    this.name = this.chains[this.chains.length - 1]
    this.rank = rank
    this.order = this.chains.length
    this.props = props.props
    this.style = props.style
    this.mixins = props.mixins
    this.resolvedProps = undefined
    this.resolvedStyle = undefined
    this.resolveGen = 0
  }
  matchContext (name, context) {
    if (this.name !== name) return false
    if (this.chains.length === 1) return true // simple rule
    if (Array.isArray(context)) {
      let j = this.chains.length - 1
      let i = context.length - 1
      while (i >= 0 && j > 0) {
        if (this.chains[j - 1] === context[i]) --j
        --i
      }
      if (j === 0) return true
    }
    return false
  }
  key () {
    return this.name
  }
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
  const cmp = r2.rank - r1.rank
  if (cmp === 0) return r2.order - r1.order
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
    this.cache = {}
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
  _addRule (selector, props, rank) {
    const rule = new Rule(selector, props, rank)
    const key = rule.key()
    if (this.rules[key] === undefined) {
      this.rules[key] = [rule]
    } else {
      const rules = this.rules[key]
      const i = rules.findIndex(el => rule.selector === el.selector && rule.rank === el.rank)
      if (i >= 0) {
        rules[i] = rule
      } else {
        rules.push(rule)
      }
    }
    this.rules[key].sort(ruleComparator)
  }
  getProps (context, ownProps) {
    let data
    if (this.cache.hasOwnProperty(context)) {
      data = this.cache[context]
    } else {
      data = this._resolve(context)
      this.cache[context] = data
    }

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
    this.cache = {}
  }
}

export default Stylesheet
