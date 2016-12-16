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
        styleSheet: PropTypes.object.isRequired,
        styleSheetContext: PropTypes.string
      }
      static childContextTypes = {
        styleSheetContext: PropTypes.string.isRequired
      }

      constructor (props, ctx) {
        super(props, ctx)
        this.styleSheet = ctx.styleSheet
        if (ctx.styleSheetContext === undefined) {
          this.path = name
        } else {
          this.path = ctx.styleSheetContext + ' ' + name
        }
      }

      getChildContext () {
        return {
          styleSheetContext: this.path
        }
      }

      render () {
        const props = this.styleSheet.getProps(this.path, this.props)
        return React.createElement(WrappedComponent, props)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
