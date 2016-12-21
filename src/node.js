import { Signal } from './mini-signals'

export default class Node {
  constructor (name, props, parent, styleSheet) {
    this.name = name
    this.props = props
    this.childProps = undefined
    this.variant = props.variant
    this.parent = parent
    this.styleSheet = styleSheet
    this.changed = new Signal()
    this.path = undefined
    this.fullPath = undefined
    this.parentSubscription = undefined
    this.changeCb = undefined
    this.update()
  }
  getChildProps () { return this.childProps }
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
    this.resolvePath()
    this.resolveChildProps()
    if (this.changeCb) this.changeCb()
  }
  resolvePath () {
    const path = this.parent === undefined ? this.name : this.parent.fullPath + ' ' + this.name
    let fullPath = path
    if (this.variant !== undefined) {
      if (Array.isArray(this.variant)) {
        fullPath += '.' + this.variant.join('.')
      } else {
        fullPath += '.' + this.variant
      }
    }
    const needNotify = this.fullPath !== undefined && this.fullPath !== fullPath
    this.path = path
    this.fullPath = fullPath
    if (needNotify) this.changed.dispatch()
  }
  resolveChildProps () {
    const childProps = this.styleSheet.getProps(this.path, this.props, this.variant)
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
