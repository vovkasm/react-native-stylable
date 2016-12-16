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
        styleSheetContext: PropTypes.string.isRequired
      }
      static childContextTypes = {
        styleSheet: PropTypes.object.isRequired,
        styleSheetContext: PropTypes.string.isRequired
      }

      constructor (props, ctx) {
        super(props, ctx)
        this.styleSheet = ctx.styleSheet
        let path = ctx.styleSheetContext
        if (path.length === 0) {
          path = name
        } else {
          path += ' ' + name
        }
        this.styleSheetContext = path
      }

      getChildContext () {
        return {
          styleSheet: this.styleSheet,
          styleSheetContext: this.styleSheetContext
        }
      }

      render () {
        const props = this.styleSheet.getProps(this.styleSheetContext, this.props)
        return React.createElement(WrappedComponent, props)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
