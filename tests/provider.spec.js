/* eslint-env mocha */

import { expect } from 'chai'
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'
import { Text, View } from 'react-native'

import { StyleProvider, Stylesheet, stylable } from '../src'

describe('Provider', function () {
  let s
  beforeEach(function () {
    s = new Stylesheet()
    s.addRules({
      Abc: {style: {flex: 1}}
    })
  })
  it('works', function () {
    const PureAbc = (props) => <View style={props.style} ><Text>Hi!</Text></View>
    PureAbc.propTypes = { style: PropTypes.any }
    const Abc = stylable('Abc')(PureAbc)

    const w = mount(<StyleProvider styleSheet={s}><Abc /></StyleProvider>)

    const view = w.find('View')
    expect(view).to.have.length(1)
    expect(view.props().style).to.be.deep.equal({flex: 1})
  })
})
