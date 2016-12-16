import React, { Children, PropTypes } from 'react'

export default class Provider extends React.Component {
  static propTypes = {
    styleSheet: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired
  }
  static childContextTypes = {
    styleSheet: PropTypes.object.isRequired,
    styleSheetContext: PropTypes.string.isRequired
  }

  constructor (props, ctx) {
    super(props, ctx)
    this.styleSheet = props.styleSheet
  }
  getChildContext () {
    return {styleSheetContext: '', styleSheet: this.styleSheet}
  }
  render () {
    return Children.only(this.props.children)
  }
}
