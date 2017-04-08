import PropTypes from 'prop-types'
import React, { Children } from 'react'

/**
 * Provides style sheet to its childs
 * @param styleSheet {StyleSheet} - style sheet to pass down
 **/
class StyleProvider extends React.Component {
  static propTypes = {
    styleSheet: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired
  }
  static childContextTypes = {
    styleSheet: PropTypes.object.isRequired
  }

  constructor (props, ctx) {
    super(props, ctx)
    this.styleSheet = props.styleSheet
  }
  getChildContext () {
    return {styleSheet: this.styleSheet}
  }
  render () {
    return Children.only(this.props.children)
  }
}

export default StyleProvider
