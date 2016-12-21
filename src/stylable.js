import React, { PropTypes } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import { Signal } from './mini-signals'

class Node {
  constructor (name, variant, parent, styleSheet) {
    this.name = name
    this.variant = variant
    this.parent = parent
    this.styleSheet = styleSheet
    this.changed = new Signal()
    this.path = undefined
    this.fullPath = undefined
    this.resolvePath()
  }
  getStyleSheet () { return this.styleSheet }
  setVariant (variant) {
    this.variant = variant
    this.resolvePath()
  }
  update () {
    this.resolvePath()
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
        styleSheetPath: PropTypes.object
      }
      static childContextTypes = {
        styleSheetPath: PropTypes.object.isRequired
      }
      static propTypes = {
        variant: PropTypes.any
      }

      constructor (props, ctx) {
        super(props, ctx)
        this.path = new Node(name, props.variant, ctx.styleSheetPath, ctx.styleSheet)
        this.parentSubscription = undefined
        this.state = { childProps: this.getChildProps(props) }
      }

      componentWillReceiveProps (nextProps) {
        if (this.path.variant !== nextProps.variant) {
          this.path.setVariant(nextProps.variant)
        }
        this.setState({ childProps: this.getChildProps(nextProps) })
      }

      componentDidMount () {
        const parentPath = this.path.parent
        if (parentPath !== undefined) {
          this.parentSubscription = parentPath.changed.add(this.parentChanged, this)
        }
      }

      componentWillUnmount () {
        if (this.parentSubscription !== undefined) {
          this.parentSubscription.detach()
          this.parentSubscription = undefined
        }
      }

      parentChanged () {
        this.path.update()
        this.setState({ childProps: this.getChildProps(this.props) })
      }

      getChildProps (props) {
        const childProps = this.path.getStyleSheet().getProps(this.path.path, props, props.variant)
        delete childProps.variant
        return childProps
      }

      getChildContext () {
        return {
          styleSheetPath: this.path
        }
      }

      render () {
        return React.createElement(WrappedComponent, this.state.childProps)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
