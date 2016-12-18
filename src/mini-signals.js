// Initially from https://github.com/Hypercubed/mini-signals but specialized for owr needs

export class SignalBinding {

  constructor (fn, thisArg) {
    this._fn = fn
    this._thisArg = thisArg
    this._next = this._prev = this._owner = null
  }

  detach () {
    if (this._owner === null) return false
    this._owner.detach(this)
    return true
  }

}

function _addSignalBinding (self, node) {
  if (!self._head) {
    self._head = node
    self._tail = node
  } else {
    self._tail._next = node
    node._prev = self._tail
    self._tail = node
  }

  node._owner = self

  return node
}

export class Signal {

  constructor () {
    this._head = this._tail = undefined
  }

  handlers (exists = false) {
    let node = this._head

    if (exists) return !!node

    const ee = []

    while (node) {
      ee.push(node)
      node = node._next
    }

    return ee
  }

  has (node) {
    if (!(node instanceof SignalBinding)) {
      throw new Error('Signal#has(): First arg must be a SignalBinding object.')
    }

    return node._owner === this
  }

  dispatch () {
    let node = this._head

    if (!node) return false

    while (node) {
      node._fn.apply(node._thisArg, arguments)
      node = node._next
    }

    return true
  }

  add (fn, thisArg = null) {
    if (typeof fn !== 'function') {
      throw new Error('Signal#add(): First arg must be a Function.')
    }
    return _addSignalBinding(this, new SignalBinding(fn, thisArg))
  }

  detach (node) {
    if (!(node instanceof SignalBinding)) {
      throw new Error('Signal#detach(): First arg must be a SignalBinding object.')
    }
    if (node._owner !== this) return this  // todo: or error?

    if (node._prev) node._prev._next = node._next
    if (node._next) node._next._prev = node._prev

    if (node === this._head) {  // first node
      this._head = node._next
      if (node._next === null) {
        this._tail = null
      }
    } else if (node === this._tail) {  // last node
      this._tail = node._prev
      this._tail._next = null
    }

    node._owner = null
    return this
  }

  detachAll () {
    let node = this._head
    if (!node) return this

    this._head = this._tail = null

    while (node) {
      node._owner = null
      node = node._next
    }
    return this
  }
}
