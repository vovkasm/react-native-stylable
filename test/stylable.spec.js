/* eslint-env mocha */

import { expect } from 'chai'
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'

import { StyleProvider, Stylesheet, stylable } from '../src'

class View extends React.Component {
  render () {
    const { children, ...other } = this.props
    return <div {...other}>{children}</div>
  }
}
View.propTypes = { children: PropTypes.node }

class Text extends React.Component {
  render () {
    const { children, ...other } = this.props
    return <span {...other}>{children}</span>
  }
}
Text.propTypes = { children: PropTypes.node }

const TitleText = stylable('Title')(Text)
const DescrText = stylable('Descr')(Text)
const Title = function PureTitle (props) { return <TitleText className='TitleText'>{props.text}</TitleText> }
Title.propTypes = { text: PropTypes.string }
const Descr = function PureDescr (props) { return <DescrText className='DescrText'>{props.text}</DescrText> }
Descr.propTypes = { text: PropTypes.string }

const ButtonView = stylable('Button')(View)
const Button = function (props) {
  const p = {}
  if (props.active) p.variant = 'active'
  return <ButtonView {...p}><Title text={props.title} /></ButtonView>
}
Button.propTypes = {
  active: PropTypes.bool,
  title: PropTypes.string
}

describe('Stylable', function () {
  let s
  beforeEach(function () {
    s = new Stylesheet()
  })
  describe('complete example', function () {
    const Page = stylable('Page')(function PurePage (props) {
      return <View><Title text='Sample' /><Descr text='Hellow world!' /></View>
    })
    const Intro = stylable('Intro')(View)

    let app
    beforeEach(function () {
      s.addDefaultRules({
        'baseText': {style: {fontSize: 10, color: 'black'}},
        'Title': {mixins: ['baseText']},
        'Descr': {mixins: ['baseText'], style: {fontStyle: 'italic'}},
        'Intro baseText': {style: {fontSize: 16}}
      })
    })
    it('has proper static structure', function () {
      app = mount(<StyleProvider styleSheet={s}><Page /></StyleProvider>)

      expect(app.find('.TitleText').props().style).to.deep.equal({fontSize: 10, color: 'black'})
      expect(app.find('.DescrText').props().style).to.deep.equal({fontSize: 10, fontStyle: 'italic', color: 'black'})
    })
    it('has proper static structure in Intro', function () {
      app = mount(<StyleProvider styleSheet={s}><Intro><Page /></Intro></StyleProvider>)

      expect(app.find('.TitleText').props().style).to.deep.equal({fontSize: 16, color: 'black'})
      expect(app.find('.DescrText').props().style).to.deep.equal({fontSize: 16, fontStyle: 'italic', color: 'black'})
    })
  })
  describe('variants', function () {
    beforeEach(function () {
      s.addDefaultRules({
        'baseText': {style: {fontSize: 10, color: 'black'}},
        'Title': {mixins: ['baseText']},
        'Title.selected': {style: {color: 'green'}}
      })
    })
    it('correctly mounted', function () {
      const el = mount(<StyleProvider styleSheet={s}><TitleText variant='selected'>Hello</TitleText></StyleProvider>)
      expect(el.find('span').props().style).to.deep.equal({fontSize: 10, color: 'green'})
    })
    it('correctly updates', function () {
      const Root = function Root (props) {
        return <StyleProvider styleSheet={s}><TitleText variant={props.variant}>Hello</TitleText></StyleProvider>
      }
      Root.propTypes = { variant: PropTypes.any }

      const el = mount(<Root />)
      expect(el.find('span').props().style).to.deep.equal({fontSize: 10, color: 'black'})
      el.setProps({variant: 'selected'})
      expect(el.find('span').props().style).to.deep.equal({fontSize: 10, color: 'green'})
    })
  })
  describe('scoped variants', function () {
    beforeEach(function () {
      s.addDefaultRules({
        'baseText': {style: {fontSize: 10, color: 'black'}},
        'Title': {mixins: ['baseText']},
        'Button.active Title': {style: {color: 'red'}}
      })
    })
    it('correctly mounted', function () {
      const Root = function Root (props) {
        return <StyleProvider styleSheet={s}><View><Button active={props.active} text='BTN' /></View></StyleProvider>
      }
      Root.propTypes = { active: PropTypes.bool }

      const el = mount(<Root />)
      expect(el.find('.TitleText').props().style).to.deep.equal({fontSize: 10, color: 'black'})
      el.setProps({active: true})
      expect(el.find('.TitleText').props().style).to.deep.equal({fontSize: 10, color: 'red'})
    })
  })
})
