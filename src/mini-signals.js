// Initially from https://github.com/Hypercubed/mini-signals but specialized for owr needs

export class SignalBinding {

  /**
  * SignalBinding constructor.
  * @constructs SignalBinding
  * @param {Function} fn Event handler to be called.
  * @param {Mixed} [thisArg] The context of the callback function.
  * @api private
  */
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

/**
* @private
*/
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

  /**
  * Signal constructor.
  * @constructs Signal
  * @api public
  *
  * @example
  * let mySignal = new Signal();
  * let binding = mySignal.add(onSignal);
  * mySignal.dispatch('foo', 'bar');
  * mySignal.detach(binding);
  */
  constructor () {
    this._head = this._tail = undefined
  }

  /**
  * Return an array of attached SignalBinding.
  *
  * @param {Boolean} [exists=false] We only need to know if there are handlers.
  * @returns {SignalBinding[]|Boolean} Array of attached SignalBinding or Boolean if called with exists = true
  * @api public
  */
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

  /**
  * Return true if node is a SignalBinding attached to this Signal
  *
  * @param {SignalBinding} node Node to check.
  * @returns {Boolean} True if node is attache to mini-signal
  * @api public
  */
  has (node) {
    if (!(node instanceof SignalBinding)) {
      throw new Error('Signal#has(): First arg must be a SignalBinding object.')
    }

    return node._owner === this
  }

  /**
  * Dispaches a signal to all registered listeners.
  *
  * @returns {Boolean} Indication if we've emitted an event.
  * @api public
  */
  dispatch () {
    let node = this._head

    if (!node) return false

    while (node) {
      node._fn.apply(node._thisArg, arguments)
      node = node._next
    }

    return true
  }

  /**
  * Register a new listener.
  *
  * @param {Function} fn Callback function.
  * @param {Mixed} [thisArg] The context of the callback function.
  * @returns {SignalBinding} The SignalBinding node that was added.
  * @api public
  */
  add (fn, thisArg = null) {
    if (typeof fn !== 'function') {
      throw new Error('Signal#add(): First arg must be a Function.')
    }
    return _addSignalBinding(this, new SignalBinding(fn, thisArg))
  }

  /**
  * Remove binding object.
  *
  * @param {SignalBinding} node The binding node that will be removed.
  * @returns {Signal} The instance on which this method was called.
  * @api public */
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

  /**
  * Detach all listeners.
  *
  * @returns {Signal} The instance on which this method was called.
  * @api public
  */
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
