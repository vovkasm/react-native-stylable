/* eslint-env jest */

import React from 'react'

import isPureComponent from '../src/isPureComponent'

test('Simple function - pure', function () {
  const Comp = function (props) { return <div /> }
  expect(isPureComponent(Comp)).toBeTruthy()
})
test('Arrow function - pure', function () {
  const Comp = (props) => { return <div /> }
  expect(isPureComponent(Comp)).toBeTruthy()
})
test('Subclass of React.PureComponent - pure', function () {
  class Comp extends React.PureComponent {
    render () {
      return <div />
    }
  }
  expect(isPureComponent(Comp)).toBeTruthy()
})
test('Subclass of React.Component - not pure', function () {
  class Comp extends React.Component {
    render () {
      return <div />
    }
  }
  expect(isPureComponent(Comp)).toBeFalsy()
})
test('Host component - not pure', function () {
  expect(isPureComponent('div')).toBeFalsy()
})
