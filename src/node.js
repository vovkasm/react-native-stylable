import { Signal } from './mini-signals'

export default class Node {
  constructor (name, props, parent, styleSheet) {
    this.name = name
    this.props = props
    this.childProps = undefined
    this.variant = props && props.variant
    this.parent = parent
    this.styleSheet = styleSheet
    this.changed = new Signal()
    this.parentSubscription = undefined
    this.changeCb = undefined
    this.update()
  }
  getChildProps () { return this.childProps }
  getName () { return this.name }
  getParent () { return this.parent }
  getStyleSheet () { return this.styleSheet }
  getVariants () { return this.variant }

  subscribe (cb) {
    this.changeCb = cb
    if (this.parent !== undefined) {
      this.parentSubscription = this.parent.changed.add(this.parentChanged, this)
    }
  }
  parentChanged () {
    this.update()
  }
  setProps (nextProps) {
    this.props = nextProps
    this.variant = nextProps.variant
    this.update()
  }
  update () {
    this.resolveChildProps()
    if (this.changeCb) this.changeCb()
  }
  resolveChildProps () {
    const childProps = this.styleSheet.getProps(this)
    delete childProps.variant
    this.childProps = childProps
  }
  dispose () {
    if (this.parentSubscription !== undefined) {
      this.parentSubscription.detach()
      this.parentSubscription = undefined
    }
    this.changed.detachAll()
  }
}
