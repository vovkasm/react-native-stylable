import test from 'tape'
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

const ContainerView = stylable('Container')(View)
const Container = function Container (props) {
  return <ContainerView>{props.content}</ContainerView>
}
Container.propTypes = { content: PropTypes.node }

test('Stylable. Complete example', function (t) {
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
  t.test('Page renders with right styles', function (t) {
    const app = mount(<StyleProvider styleSheet={s}><Page /></StyleProvider>)

    t.deepEqual(app.find('.TitleText').props().style, {fontSize: 10, color: 'black'})
    t.deepEqual(app.find('.DescrText').props().style, {fontSize: 10, fontStyle: 'italic', color: 'black'})
    t.end()
  })
  t.test('Page inside Intro renders with right styles', function (t) {
    const app = mount(<StyleProvider styleSheet={s}><Intro><Page /></Intro></StyleProvider>)

    t.deepEqual(app.find('.TitleText').props().style, {fontSize: 16, color: 'black'})
    t.deepEqual(app.find('.DescrText').props().style, {fontSize: 16, fontStyle: 'italic', color: 'black'})
    t.end()
  })
  t.end()
})

test('setNativeProps', function (t) {
  const s = new Stylesheet()
  let ref1
  let ref2
  let cnt = 0
  let lastNativeProps
  class ViewWithNativePropsComp extends React.Component {
    render () {
      return <div {...this.props} />
    }
    setNativeProps (props) {
      cnt++
      lastNativeProps = props
    }
  }
  const ViewWithNativeProps = stylable('ViewWithNativeProps')(ViewWithNativePropsComp)
  const Root = function Root (props) {
    return <StyleProvider styleSheet={s}>
      <View>
        <ViewWithNativeProps ref={el => { ref1 = el }} />
        <Text ref={el => { ref2 = el }}>hi</Text>
      </View>
    </StyleProvider>
  }

  mount(<Root />)

  t.is(typeof ref1['setNativeProps'], 'function', 'ref1 responds to setNativeProps')
  ref1.setNativeProps({abc: 1})
  t.is(cnt, 1, 'setNativeProps was actually called')
  t.deepEqual(lastNativeProps, {abc: 1}, 'with right argument')

  t.false(typeof ref2['setNativeProps'] === 'function', 'ref2 do not responds to setNativeProps')
  t.end()
})

test('variants', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'baseText': {style: {fontSize: 10, color: 'black'}},
    'Title': {mixins: ['baseText']},
    'Title.selected': {style: {color: 'green'}}
  })

  const Root = function Root (props) {
    return <StyleProvider styleSheet={s}><TitleText variant={props.variant}>Hello</TitleText></StyleProvider>
  }
  Root.propTypes = { variant: PropTypes.any }

  const el = mount(<Root variant='selected' />)
  t.deepEqual(el.find('span').props().style, {fontSize: 10, color: 'green'})
  el.setProps({variant: undefined})
  t.deepEqual(el.find('span').props().style, {fontSize: 10, color: 'black'})
  t.end()
})

test('scoped variants', function (t) {
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

  const el = mount(<Root />)
  t.deepEqual(el.find('.TitleText').props().style, {fontSize: 10, color: 'black'})
  el.setProps({active: true})
  t.deepEqual(el.find('.TitleText').props().style, {fontSize: 10, color: 'red'})
  t.end()
})

test('Out of tree comps', function (t) {
  const s = new Stylesheet()
  s.addDefaultRules({
    'Title': {style: {fontSize: 1}},
    'Container Title': {style: {fontSize: 2}}
  })
  const Root = function Root (props) {
    const title = <Title text='title1' />
    return <StyleProvider styleSheet={s}><Container content={title} /></StyleProvider>
  }

  const el = mount(<Root />)
  t.deepEqual(el.find('.TitleText').props().style, {fontSize: 2})
  t.end()
})
