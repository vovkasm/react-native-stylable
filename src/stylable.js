import React, { PropTypes } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import { Signal } from './mini-signals'

class Node {
  constructor (name, props, parent, styleSheet) {
    this.name = name
    this.props = props
    this.childProps = undefined
    this.variant = props.variant
    this.parent = parent
    this.styleSheet = styleSheet
    this.changed = new Signal()
    this.path = undefined
    this.fullPath = undefined
    this.parentSubscription = undefined
    this.changeCb = undefined
    this.update()
  }
  getChildProps () { return this.childProps }
  subscribe (cb) {
    this.changeCb = cb
    if (this.parent !== undefined) {
      this.parentSubscription = this.parent.changed.add(this.parentChanged, this)
    }
  }
  parentChanged () {
    this.update()
  }
  setProps (nextProps) {
    this.props = nextProps
    this.variant = nextProps.variant
    this.update()
  }
  update () {
    this.resolvePath()
    this.resolveChildProps()
    if (this.changeCb) this.changeCb()
  }
  resolvePath () {
    const path = this.parent === undefined ? this.name : this.parent.fullPath + ' ' + this.name
    let fullPath = path
    if (this.variant !== undefined) {
      if (Array.isArray(this.variant)) {
        fullPath += '.' + this.variant.join('.')
      } else {
        fullPath += '.' + this.variant
      }
    }
    const needNotify = this.fullPath !== undefined && this.fullPath !== fullPath
    this.path = path
    this.fullPath = fullPath
    if (needNotify) this.changed.dispatch()
  }
  resolveChildProps () {
    const childProps = this.styleSheet.getProps(this.path, this.props, this.variant)
    delete childProps.variant
    this.childProps = childProps
  }
  dispose () {
    if (this.parentSubscription !== undefined) {
      this.parentSubscription.detach()
      this.parentSubscription = undefined
    }
    this.changed.detachAll()
  }
}

function getDisplayName (comp) {
  return comp.displayName || comp.name || 'Component'
}

export default function stylable (name) {
  return function wrapWithComponent (WrappedComponent) {
    const stylableDisplayName = `Stylable(${getDisplayName(WrappedComponent)})`

    class Stylable extends React.Component {
      static displayName = stylableDisplayName
      static WrappedComponent = WrappedComponent
      static contextTypes = {
        styleSheet: PropTypes.object.isRequired,
        styleNode: PropTypes.object
      }
      static childContextTypes = {
        styleNode: PropTypes.object.isRequired
      }
      static propTypes = {
        variant: PropTypes.any
      }

      constructor (props, ctx) {
        super(props, ctx)
        this.node = new Node(name, props, ctx.styleNode, ctx.styleSheet)
        this.state = { childProps: this.node.getChildProps() }
      }

      componentWillReceiveProps (nextProps) {
        this.node.setProps(nextProps)
      }

      componentDidMount () {
        this.node.subscribe(this.nodeChanged)
      }

      componentWillUnmount () {
        this.node.dispose()
      }

      nodeChanged = () => {
        this.setState({ childProps: this.node.getChildProps() })
      }

      render () {
        return React.createElement(WrappedComponent, this.state.childProps)
      }

      getChildContext () {
        return { styleNode: this.node }
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
