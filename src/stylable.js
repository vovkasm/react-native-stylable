import React, { PropTypes } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import { Signal } from './mini-signals'

class Path {
  constructor (name, parent) {
    this.name = name
    this.path = parent === undefined ? name : parent.path + ' ' + name
    this.changed = new Signal()
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

      constructor (props, ctx) {
        super(props, ctx)
        this.styleSheet = ctx.styleSheet
        this.path = new Path(name, ctx.styleSheetPath)
      }

      getChildContext () {
        return {
          styleSheetPath: this.path
        }
      }

      render () {
        const props = this.styleSheet.getProps(this.path.path, this.props)
        return React.createElement(WrappedComponent, props)
      }
    }

    return hoistStatics(Stylable, WrappedComponent)
  }
}
