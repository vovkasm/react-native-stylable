
import Node from './node'
import { parseSelector } from './selectors'

class Rule {
  constructor (selector, props, rank) {
    this.selector = selector
    this.rank = rank
    this.props = props.props
    this.style = props.style
    this.mixins = props.mixins
  }
  getKey () { return this.selector.getName() }
  getSelector () { return this.selector.toString() }
  getRank () { return this.rank }
  getOrder () { return this.selector.getSpecificity() }
  matchContext (node) { return this.selector.matchContext(node) }
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

function mergeRules (props, rules) {
  const ownStyle = props.style
  const style = {}
  let isStyle = false
  for (let i in rules) {
    const rule = rules[i]
    if (rule.props !== undefined) {
      mergeTo(props, rule.props)
    }
    if (rule.style !== undefined) {
      mergeTo(style, rule.style)
      isStyle = true
    }
  }
  if (isStyle) {
    if (ownStyle === undefined) {
      props.style = style
    } else if (Array.isArray(ownStyle)) {
      const newStyle = ownStyle.slice()
      newStyle.unshift(style)
      props.style = newStyle
    } else {
      props.style = [style, ownStyle]
    }
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

/**
 * Represents collections of all style rules.
 *
 **/
class Stylesheet {
  constructor () {
    this.rules = {}
  }
  /**
   * Adds "default" lower priority rules to style sheet
   *
   * @param rules {Object} - key-value pairs, key is a selector, value is rule object
   **/
  addDefaultRules (rules) {
    for (let selector in rules) {
      this._addRule(selector, rules[selector], 0)
    }
  }
  /**
   * Adds rules to style sheet
   *
   * @param rules {Object} - key-value pairs, key is a selector, value is rule object
   **/
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
    const selector = parseSelector(selectorValue)
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
  getProps (node) {
    const ownProps = node.props
    const props = shallowClone(ownProps)

    const rules = []
    this.collectRules(rules, node)
    mergeRules(props, rules)
    return props
  }
  collectRules (target, node) {
    if (this.rules[node.getName()] !== undefined) {
      const rules = this.rules[node.getName()]
      for (let i in rules) {
        const rule = rules[i]
        if (rule.matchContext(node)) {
          target.push(rule)
          if (rule.mixins !== undefined) {
            for (let j = 0; j < rule.mixins.length; ++j) {
              // TODO: this inoptimal
              const mixNode = new Node(rule.mixins[j], undefined, node.getParent(), node.getStyleSheet())
              this.collectRules(target, mixNode)
            }
          }
        }
      }
    }
  }
}

export default Stylesheet
