import PropTypes from 'prop-types'
import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

import Node from './node'
import isPureComponent from './isPureComponent'
import getDisplayName from './getDisplayName'

export default function stylable (selName) {
  return function wrapWithComponent (WrappedComponent) {
    const stylableDisplayName = `Stylable(${selName})(${getDisplayName(WrappedComponent)})`
    const pureComponent = isPureComponent(WrappedComponent)

    class Stylable extends React.Component {
      static name = selName
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
        this.node = new Node(selName, props, ctx.styleNode, ctx.styleSheet)
        this.state = { childProps: this.node.getChildProps() }
        this._wrapped = undefined
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

      _setWrappedRef = (el) => { this._wrapped = el }

      getChildContext () {
        return { styleNode: this.node }
      }
    }

    function stylablePureRender () {
      return React.createElement(WrappedComponent, this.state.childProps)
    }

    function stylableWillMount () {
      // HUCK: no public api for this
      if (this._reactInternalInstance && !this._reactInternalInstance.ref) {
        // we don't need ref handling
        this.render = stylablePureRender
      }
    }

    function stylableRender () {
      return React.createElement(WrappedComponent, { ...this.state.childProps, ref: this._setWrappedRef })
    }

    if (pureComponent) {
      Stylable.prototype.render = stylablePureRender
    } else {
      Stylable.prototype.componentWillMount = stylableWillMount
      Stylable.prototype.render = stylableRender
    }

    const proto = WrappedComponent.prototype
    if (typeof proto.setNativeProps === 'function') {
      Stylable.prototype.setNativeProps = function (props) {
        this._wrapped && this._wrapped.setNativeProps(props)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
