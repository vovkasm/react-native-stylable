/* eslint-env jest */
import { Signal, SignalBinding } from '../src/mini-signals'

function prepare () {
  const pattern = []
  const ctx = {}
  ctx.e = new Signal()
  ctx.pattern = pattern
  ctx.writer = function (a) { pattern.push(this + ':' + a) }
  return ctx
}

describe('Signal', function () {
  it('quick test', function () {
    const { e, pattern, writer } = prepare()

    var foo = e.add(writer, 'foo')
    e.add(writer, 'baz')
    var bar = e.add(writer, 'bar')

    expect(e).toBeInstanceOf(Signal)
    expect(foo).toBeInstanceOf(SignalBinding)

    e.dispatch('banana')
    e.dispatch('appple')

    foo.detach()
    bar.detach()

    e.dispatch('pear')

    e.detachAll()

    e.dispatch('raspberry')

    expect(pattern.join(';')).toBe('foo:banana;baz:banana;bar:banana;foo:appple;baz:appple;bar:appple;baz:pear')
  })

  describe('Signal#add', function () {
    it('add throw error for incorrect types', function () {
      const e = new Signal()
      expect(function () { e.add() }).toThrowError('Signal#add(): First arg must be a Function.')
      expect(function () { e.add(123) }).toThrowError('Signal#add(): First arg must be a Function.')
      expect(function () { e.add(true) }).toThrowError('Signal#add(): First arg must be a Function.')
    })
  })

  describe('Signal#dispatch', function () {
    it('should return false when there are not events to dispatch', function () {
      const { e } = prepare()

      expect(e.dispatch('foo')).toBeFalsy()
      expect(e.dispatch('bar')).toBeFalsy()
    })
    it('emits with context when function is bound function', function () {
      expect.assertions(3)
      const e = new Signal()
      const context = {bar: 'baz'}

      const cb = function (bar) {
        expect(bar).toBe('bar')
        expect(this).toBe(context)
        expect(arguments).toHaveLength(1)
      }.bind(context)

      e.add(cb)

      e.dispatch('bar')
    })
    it('emits with context when context is specified', function () {
      expect.assertions(3)
      const e = new Signal()
      const context = {bar: 'baz'}

      const cb = function (bar) {
        expect(bar).toBe('bar')
        expect(this).toBe(context)
        expect(arguments).toHaveLength(1)
      }

      e.add(cb, context)

      e.dispatch('bar')
    })
    it('can dispatch the function with multiple arguments', function () {
      for (var i = 0; i < 100; i++) {
        const e = new Signal();
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.add(function () { expect(arguments).toHaveLength(args.length) })

          e.dispatch.apply(e, args)
        })(i)
      }
    })
    it('can dispatch the function with multiple arguments, multiple listeners', function () {
      for (var i = 0; i < 100; i++) {
        const e = new Signal();
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.add(function () { expect(arguments).toHaveLength(args.length) })
          e.add(function () { expect(arguments).toHaveLength(args.length) })
          e.add(function () { expect(arguments).toHaveLength(args.length) })
          e.add(function () { expect(arguments).toHaveLength(args.length) })

          e.dispatch.apply(e, args)
        })(i)
      }
    })
    it('can dispatch many listeners', function () {
      const e = new Signal()

      var N = 10000
      var sum = 0

      function add (i) {
        sum += i
      }

      for (var i = 0; i <= N; i++) {
        e.add(add.bind(this, i))
      }

      e.dispatch()

      expect(sum).toBe(N * (N + 1) / 2)
    })
    it('emits with context, multiple listeners (force loop)', function () {
      const e = new Signal()

      e.add(function (bar) {
        expect(this).toEqual({ foo: 'bar' })
        expect(bar).toBe('bar')
      }, { foo: 'bar' })

      e.add(function (bar) {
        expect(this).toEqual({ bar: 'baz' })
        expect(bar).toBe('bar')
      }, { bar: 'baz' })

      e.dispatch('bar')
    })
    it('emits with different contexts', function () {
      const { e, writer, pattern } = prepare()
      e.add(writer, 'foo')
      e.add(writer, 'baz')
      e.add(writer, 'bar')
      e.add(writer, 'banana')

      e.dispatch('a')
      expect(pattern.join(',')).toBe('foo:a,baz:a,bar:a,banana:a')
    })
    it('should return true when there are events to dispatch', function (done) {
      const e = new Signal()
      e.add(function () {
        process.nextTick(function () { done() })
      })

      expect(e.dispatch()).toBeTruthy()
    })
    it('should return false when there are no events to dispatch', function () {
      const e = new Signal()
      expect(e.dispatch()).toBeFalsy()
    })
    it('receives the emitted events', function (done) {
      const e = new Signal()

      e.add(function (a, b, c, d, undef) {
        expect(a).toBe('foo')
        expect(b).toBe(e)
        expect(c).toBeInstanceOf(Date)
        expect(undef).toBeUndefined()
        expect(arguments).toHaveLength(3)
        done()
      })

      e.dispatch('foo', e, new Date())
    })
    it('emits to all event listeners', function () {
      const { e, pattern } = prepare()

      e.add(function () {
        pattern.push('foo1')
      })

      e.add(function () {
        pattern.push('foo2')
      })

      e.dispatch()

      expect(pattern.join(';')).toBe('foo1;foo2')
    })
  })
  describe('Signal#detach', function () {
    let e
    let pattern = []

    function foo () { pattern.push('foo') }
    function bar () { pattern.push('bar') }
    function a () { pattern.push('a') }
    function b () { pattern.push('b') }

    beforeEach(function () {
      e = new Signal()
      pattern = []
    })
    it('should throw an error if not a SignalBinding', function () {
      expect(function () { e.detach() }).toThrowError('Signal#detach(): First arg must be a SignalBinding object.')
      expect(function () { e.detach(1) }).toThrowError('Signal#detach(): First arg must be a SignalBinding object.')
      expect(function () { e.detach(bar) }).toThrowError('Signal#detach(): First arg must be a SignalBinding object.')
    })
    it('should only remove the event with the specified node', function () {
      e.add(a)
      e.add(b)
      const _bar = e.add(bar)

      e.dispatch()
      expect(pattern.join(';')).toBe('a;b;bar')

      e.detach(_bar)
      e.dispatch()
      expect(pattern.join(';')).toBe('a;b;bar;a;b')
    })
    it('should remove from front', function () {
      prepare()
      const _bar = e.add(bar)
      e.add(a)
      e.add(b)

      e.dispatch()
      expect(pattern.join(';')).toBe('bar;a;b')

      e.detach(_bar)
      e.dispatch()
      expect(pattern.join(';')).toBe('bar;a;b;a;b')
    })
    it('should remove from middle', function () {
      e.add(a)
      const _bar = e.add(bar)
      e.add(b)

      e.dispatch()
      expect(pattern.join(';')).toBe('a;bar;b')

      e.detach(_bar)
      e.dispatch()
      expect(pattern.join(';')).toBe('a;bar;b;a;b')
    })
    it('can remove previous node in dispatch', function () {
      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }

      const _foo = e.add(foo)
      e.add(foo2)
      e.add(a)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).toBe('foo;foo2;a;foo2;a')
    })
    it('can remove next node in dispatch', function () {
      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }

      e.add(a)
      e.add(foo2)
      var _foo = e.add(foo)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).toBe('a;foo2;a;foo2')  // will remove node this dispatch (might be unexpected)
    })
    it('can be called multiple times', function () {
      const e = new Signal()

      const binding = e.add(foo)
      expect(binding._owner).toBe(e)
      e.detach(binding)
      expect(binding._owner).toBeNull()
      e.detach(binding)
      e.detach(binding)
      binding.detach()
    })
  })
  it('Signal#has', function () {
    function oops () { throw new Error('oops') }

    const e = new Signal()
    const e2 = new Signal()

    const binding = e.add(oops)
    expect(e.has(binding)).toBeTruthy()
    expect(e2.has(binding)).toBeFalsy()

    binding.detach()

    expect(e.has(binding)).toBeFalsy()

    const binding2 = e.add(oops)

    e.detachAll()

    expect(e.has(binding2)).toBeFalsy()
    expect(function () { e.has({}) }).toThrowError('Signal#has(): First arg must be a SignalBinding object.')
  })
  it('Signal#detachAll', function () {
    const e = new Signal()
    const pattern = []
    const l1 = function () { pattern.push('l1') }
    const l2 = function () { pattern.push('l2') }

    expect(e.detachAll()).toBe(e)

    e.add(l1)
    e.add(l2)

    e.detachAll()

    e.dispatch()

    expect(pattern.join(',')).toBe('')
  })
  it('Signal#handlers', function () {
    const e = new Signal()

    function foo () {}

    expect(e.handlers()).toBeInstanceOf(Array)
    expect(e.handlers(false)).toBeInstanceOf(Array)
    expect(e.handlers()).toHaveLength(0)
    expect(e.handlers(false)).toHaveLength(0)
    expect(e.handlers(true)).toBeFalsy()

    e.add(foo)

    expect(e.handlers()).toHaveLength(1)
    expect(e.handlers()[0]).toBeInstanceOf(SignalBinding)
    expect(e.handlers(true)).toBeTruthy()

    e.add(foo)

    expect(e.handlers()).toHaveLength(2)
    expect(e.handlers(true)).toBeTruthy()

    e.detachAll()

    expect(e.handlers()).toHaveLength(0)
    expect(e.handlers(true)).toBeFalsy()
  })
})
