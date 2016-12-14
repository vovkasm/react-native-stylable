import React, { PropTypes } from 'react'
import hoistStatics from 'hoist-non-react-statics'

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
        styleSheetContext: PropTypes.object
      }
      static childContextTypes = {
        styleSheetContext: PropTypes.object
      }
      static propTypes = {
        styleSheet: PropTypes.object
      }

      constructor (props, ctx) {
        super(props, ctx)
        let sCtx
        if (props.styleSheet !== undefined) {
          sCtx = {
            path: undefined,
            styleSheet: props.styleSheet
          }
        } else {
          const path = ctx.styleSheetContext === undefined ? name : ctx.styleSheetContext.path + ' ' + name
          sCtx = {
            path: path,
            styleSheet: ctx.styleSheetContext.styleSheet
          }
        }
        this.sCtx = sCtx
      }

      getChildContext () {
        return {styleSheetContext: this.sCtx}
      }

      render () {
        const props = this.sCtx.styleSheet.getProps(this.sCtx.path, this.props)
        return React.createElement(WrappedComponent, props)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
