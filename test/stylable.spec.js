/* eslint-env jest */

import PropTypes from 'prop-types'
import React from 'react'
import { View, Text } from 'react-native'
import Renderer from 'react-test-renderer'

import { StyleProvider, Stylesheet, stylable } from '../src'

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

const ContainerView = stylable('Container')(View)
const Container = function Container (props) {
  return <ContainerView>{props.content}</ContainerView>
}
Container.propTypes = { content: PropTypes.node }

describe('Stylable. Complete example', function () {
  const Page = stylable('Page')(function PurePage (props) {
    return <View><Title text='Sample' /><Descr text='Hellow world!' /></View>
  })
  const Intro = stylable('Intro')(View)
  const s = new Stylesheet()
  s.addDefaultRules({
    'baseText': {style: {fontSize: 10, color: 'black'}},
    'Title': {mixins: ['baseText']},
    'Descr': {mixins: ['baseText'], style: {fontStyle: 'italic'}},
    'Intro baseText': {style: {fontSize: 16}}
  })
  test('Page renders with right styles', function () {
    const app = Renderer.create(<StyleProvider styleSheet={s}><Page /></StyleProvider>)
    expect(app.toJSON()).toHaveProperty('children.0.props.style', {fontSize: 10, color: 'black'})
    expect(app.toJSON()).toHaveProperty('children.1.props.style', {fontSize: 10, fontStyle: 'italic', color: 'black'})
  })
  test('Page inside Intro renders with right styles', function () {
    const app = Renderer.create(<StyleProvider styleSheet={s}><Intro><Page /></Intro></StyleProvider>)
    expect(app.toJSON()).toHaveProperty('children.0.children.0.props.style', {fontSize: 16, color: 'black'})
    expect(app.toJSON()).toHaveProperty('children.0.children.1.props.style', {fontSize: 16, fontStyle: 'italic', color: 'black'})
  })
})

test('setNativeProps', function () {
  const s = new Stylesheet()
  let ref1
  let ref2
  let cnt = 0
  let lastNativeProps
  class NoNativePropsComp extends React.Component {
    render () { return <View /> }
  }
  class ViewWithNativePropsComp extends React.Component {
    render () { return <View /> }
    setNativeProps (props) {
      cnt++
      lastNativeProps = props
    }
  }
  const ViewWithNativeProps = stylable('ViewWithNativeProps')(ViewWithNativePropsComp)
  const NoNativeProps = stylable('NoNativeProps')(NoNativePropsComp)
  const elements = <StyleProvider styleSheet={s}>
    <View>
      <ViewWithNativeProps ref={el => { ref1 = el }} />
      <NoNativeProps ref={el => { ref2 = el }} />
      <ViewWithNativeProps />
    </View>
  </StyleProvider>

  Renderer.create(elements)

  expect(ref1.setNativeProps).toBeInstanceOf(Function)
  ref1.setNativeProps({abc: 1})
  expect(cnt).toBe(1)
  expect(lastNativeProps).toEqual({abc: 1})

  expect(ref2.setNativeProps).not.toBeInstanceOf(Function)
})

test('variants', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'baseText': {style: {fontSize: 10, color: 'black'}},
    'Title': {mixins: ['baseText']},
    'Title.selected': {style: {color: 'green'}}
  })

  const Root = (props) => {
    return <StyleProvider styleSheet={s}><TitleText variant={props.variant}>Hello</TitleText></StyleProvider>
  }
  Root.propTypes = { variant: PropTypes.any }

  const app = Renderer.create(<Root variant='selected' />)

  expect(app.toJSON()).toHaveProperty('props.style', {fontSize: 10, color: 'green'})
  app.update(<Root variant={undefined} />)
  expect(app.toJSON()).toHaveProperty('props.style', {fontSize: 10, color: 'black'})
})

test('scoped variants', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'baseText': {style: {fontSize: 10, color: 'black'}},
    'Title': {mixins: ['baseText']},
    'Button.active Title': {style: {color: 'red'}}
  })
  const Root = function Root (props) {
    return <StyleProvider styleSheet={s}><View><Button active={props.active} text='BTN' /></View></StyleProvider>
  }
  Root.propTypes = { active: PropTypes.bool }

  const app = Renderer.create(<Root />)
  expect(app.toJSON()).toHaveProperty('children.0.children.0.props.style', {fontSize: 10, color: 'black'})
  app.update(<Root active />)
  expect(app.toJSON()).toHaveProperty('children.0.children.0.props.style', {fontSize: 10, color: 'red'})
})

test('Out of tree comps', function () {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Title': {style: {fontSize: 1}},
    'Container Title': {style: {fontSize: 2}}
  })
  const Root = function Root (props) {
    const title = <Title text='title1' />
    return <StyleProvider styleSheet={s}><Container content={title} /></StyleProvider>
  }

  const app = Renderer.create(<Root />)
  expect(app.toJSON()).toHaveProperty('children.0.props.style', {fontSize: 2})
})
