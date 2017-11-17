/* eslint-env jest */

import React from 'react'
import { View } from 'react-native'

import getDisplayName from '../src/getDisplayName'

test('Simple anon function', function () {
  const Comp = function (props) { return <div /> }
  expect(getDisplayName(Comp)).toEqual('Comp')
})
test('Simple named function', function () {
  const Comp = function Sample (props) { return <div /> }
  expect(getDisplayName(Comp)).toEqual('Sample')
})
test('Arrow function', function () {
  const Sample = (props) => { return <div /> }
  expect(getDisplayName(Sample)).toEqual('Sample')
})
test('Subclass of React.PureComponent', function () {
  class Sample extends React.PureComponent {
    render () {
      return <div />
    }
  }
  expect(getDisplayName(Sample)).toEqual('Sample')
})
test('Subclass of React.Component', function () {
  class Sample extends React.Component {
    render () {
      return <div />
    }
  }
  expect(getDisplayName(Sample)).toEqual('Sample')
})
test('RN View', function () {
  expect(getDisplayName(View)).toEqual('View')
})
test('Host component (RCTView for ex)', function () {
  expect(getDisplayName('RCTView')).toEqual('RCTView')
})
