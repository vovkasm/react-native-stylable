
import test from 'tape'

import { Signal, SignalBinding } from '../src/mini-signals'

function prepare () {
  const pattern = []
  const ctx = {}
  ctx.e = new Signal()
  ctx.pattern = pattern
  ctx.writer = function (a) { pattern.push(this + ':' + a) }
  return ctx
}

test('Signal. quick test', function (t) {
  const { e, pattern, writer } = prepare()

  var foo = e.add(writer, 'foo')
  e.add(writer, 'baz')
  var bar = e.add(writer, 'bar')

  t.ok(e instanceof Signal, 'it is Signal')
  t.ok(foo instanceof SignalBinding, 'it is SignalBinding')

  e.dispatch('banana')
  e.dispatch('appple')

  foo.detach()
  bar.detach()

  e.dispatch('pear')

  e.detachAll()

  e.dispatch('raspberry')

  t.equal(pattern.join(';'), 'foo:banana;baz:banana;bar:banana;foo:appple;baz:appple;bar:appple;baz:pear')
  t.end()
})

test('Signal#add', function (t) {
  const e = new Signal()

  t.test('should throw error for incorrect types', function (t) {
    t.throws(function () { e.add() }, 'Signal#add(): First arg must be a Function.')
    t.throws(function () { e.add(123) }, 'Signal#add(): First arg must be a Function.')
    t.throws(function () { e.add(true) }, 'Signal#add(): First arg must be a Function.')
    t.looseEqual(e.handlers(), [])
    t.end()
  })

  t.end()
})

test('Signal#dispatch', function (t) {
  t.test('should return false when there are not events to dispatch', function (t) {
    const { e } = prepare()

    t.equal(e.dispatch('foo'), false)
    t.equal(e.dispatch('bar'), false)
    t.end()
  })

  t.test('emits with context when function is bound function', function (t) {
    const e = new Signal()
    const context = {bar: 'baz'}

    const cb = function (bar) {
      t.equal(bar, 'bar')
      t.equal(this, context)
      t.equal(arguments.length, 1)
    }.bind(context)

    e.add(cb)

    e.dispatch('bar')
    t.end()
  })

  t.test('emits with context when context is specified', function (t) {
    const e = new Signal()
    const context = {bar: 'baz'}

    e.add(function (bar) {
      t.equal(bar, 'bar')
      t.equal(this, context)
      t.equal(arguments.length, 1)
    }, context)

    e.dispatch('bar')
    t.end()
  })

  t.test('can dispatch the function with multiple arguments', function (t) {
    for (var i = 0; i < 100; i++) {
      const e = new Signal();
      (function (j) {
        for (var i = 0, args = []; i < j; i++) {
          args.push(j)
        }

        e.add(function () {
          t.equal(arguments.length, args.length)
        })

        e.dispatch.apply(e, args)
      })(i)
    }

    t.end()
  })

  t.test('can dispatch the function with multiple arguments, multiple listeners', function (t) {
    for (var i = 0; i < 100; i++) {
      const e = new Signal();
      (function (j) {
        for (var i = 0, args = []; i < j; i++) {
          args.push(j)
        }

        e.add(function () {
          t.equal(arguments.length, args.length)
        })

        e.add(function () {
          t.equal(arguments.length, args.length)
        })

        e.add(function () {
          t.equal(arguments.length, args.length)
        })

        e.add(function () {
          t.equal(arguments.length, args.length)
        })

        e.dispatch.apply(e, args)
      })(i)
    }
    t.end()
  })

  t.test('can dispatch many listeners', function (t) {
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

    t.equal(sum, N * (N + 1) / 2)
    t.end()
  })

  t.test('emits with context, multiple listeners (force loop)', function (t) {
    const e = new Signal()

    e.add(function (bar) {
      t.deepEqual(this, { foo: 'bar' })
      t.equal(bar, 'bar')
    }, { foo: 'bar' })

    e.add(function (bar) {
      t.deepEqual(this, { bar: 'baz' })
      t.equal(bar, 'bar')
    }, { bar: 'baz' })

    e.dispatch('bar')
    t.end()
  })

  t.test('emits with different contexts', function (t) {
    const { e, writer, pattern } = prepare()
    e.add(writer, 'foo')
    e.add(writer, 'baz')
    e.add(writer, 'bar')
    e.add(writer, 'banana')

    e.dispatch('a')
    t.equal(pattern.join(','), 'foo:a,baz:a,bar:a,banana:a')
    t.end()
  })

  t.test('should return true when there are events to dispatch', function (t) {
    const e = new Signal()
    e.add(function () {
      process.nextTick(function () { t.end() })
    })

    t.equal(e.dispatch(), true)
  })

  t.test('should return false when there are no events to dispatch', function (t) {
    const e = new Signal()
    t.test(e.dispatch(), false)
    t.end()
  })

  t.test('receives the emitted events', function (t) {
    const e = new Signal()

    e.add(function (a, b, c, d, undef) {
      t.equal(a, 'foo')
      t.equal(b, e)
      t.ok(c instanceof Date)
      t.equal(undef, undefined)
      t.equal(arguments.length, 3)

      t.end()
    })

    e.dispatch('foo', e, new Date())
  })

  t.test('emits to all event listeners', function (t) {
    const { e, pattern } = prepare()

    e.add(function () {
      pattern.push('foo1')
    })

    e.add(function () {
      pattern.push('foo2')
    })

    e.dispatch()

    t.equal(pattern.join(';'), 'foo1;foo2')
    t.end()
  })

  t.end()
})

test('Signal#detach', function (t) {
  let e
  let pattern = []

  function foo () { pattern.push('foo') }
  function bar () { pattern.push('bar') }
  function a () { pattern.push('a') }
  function b () { pattern.push('b') }

  function prepare () {
    e = new Signal()
    pattern = []
  }

  t.test('should throw an error if not a SignalBinding', function (t) {
    prepare()
    t.throws(function () { e.detach() }, 'Signal#detach(): First arg must be a SignalBinding object.')
    t.throws(function () { e.detach(1) }, 'Signal#detach(): First arg must be a SignalBinding object.')
    t.throws(function () { e.detach(bar) }, 'Signal#detach(): First arg must be a SignalBinding object.')
    t.end()
  })

  t.test('should only remove the event with the specified node', function (t) {
    prepare()
    e.add(a)
    e.add(b)
    const _bar = e.add(bar)

    e.dispatch()
    t.is(pattern.join(';'), 'a;b;bar')

    e.detach(_bar)
    e.dispatch()
    t.is(pattern.join(';'), 'a;b;bar;a;b')
    t.end()
  })

  t.test('should remove from front', function (t) {
    prepare()
    const _bar = e.add(bar)
    e.add(a)
    e.add(b)

    e.dispatch()
    t.is(pattern.join(';'), 'bar;a;b')

    e.detach(_bar)
    e.dispatch()
    t.is(pattern.join(';'), 'bar;a;b;a;b')
    t.end()
  })

  t.test('should remove from middle', function (t) {
    prepare()
    e.add(a)
    const _bar = e.add(bar)
    e.add(b)

    e.dispatch()
    t.is(pattern.join(';'), 'a;bar;b')

    e.detach(_bar)
    e.dispatch()
    t.is(pattern.join(';'), 'a;bar;b;a;b')
    t.end()
  })

  t.test('can remove previous node in dispatch', function (t) {
    prepare()

    function foo2 () {
      pattern.push('foo2')
      e.detach(_foo)
    }

    const _foo = e.add(foo)
    e.add(foo2)
    e.add(a)

    e.dispatch()
    e.dispatch()

    t.is(pattern.join(';'), 'foo;foo2;a;foo2;a')

    t.end()
  })

  t.test('can remove next node in dispatch', function (t) {
    prepare()

    e.add(a)
    e.add(foo2)
    var _foo = e.add(foo)

    e.dispatch()
    e.dispatch()

    t.is(pattern.join(';'), 'a;foo2;a;foo2')  // will remove node this dispatch (might be unexpected)

    function foo2 () {
      pattern.push('foo2')
      e.detach(_foo)
    }

    t.end()
  })

  t.test('can be called multiple times', function (t) {
    const e = new Signal()

    const binding = e.add(foo)
    t.is(binding._owner, e)
    e.detach(binding)
    t.is(binding._owner, null)
    e.detach(binding)
    e.detach(binding)
    binding.detach()

    t.end()
  })

  t.end()
})

test('Signal#has', function (t) {
  function oops () { throw new Error('oops') }

  const e = new Signal()
  const e2 = new Signal()

  const binding = e.add(oops)
  t.true(e.has(binding))
  t.false(e2.has(binding))

  binding.detach()

  t.false(e.has(binding))

  const binding2 = e.add(oops)

  e.detachAll()

  t.false(e.has(binding2), 'has returns false after detachAll')
  t.throws(function () { e.has({}) }, 'Signal#has(): First arg must be a SignalBinding object.')
  t.end()
})

test('Signal#detachAll', function (t) {
  const e = new Signal()
  const pattern = []
  const l1 = function () { pattern.push('l1') }
  const l2 = function () { pattern.push('l2') }

  t.is(e.detachAll(), e, 'detachAll can be called on signal without listeners')

  e.add(l1)
  e.add(l2)

  e.detachAll()

  e.dispatch()

  t.is(pattern.join(','), '')

  t.end()
})

test('Signal#handlers', function (t) {
  const e = new Signal()

  function foo () {}

  t.ok(e.handlers() instanceof Array)
  t.ok(e.handlers(false) instanceof Array)
  t.is(e.handlers().length, 0)
  t.is(e.handlers(false).length, 0)
  t.false(e.handlers(true))

  e.add(foo)

  t.is(e.handlers().length, 1)
  t.ok(e.handlers()[0] instanceof SignalBinding)
  t.true(e.handlers(true))

  e.add(foo)

  t.is(e.handlers().length, 2)
  t.true(e.handlers(true))

  e.detachAll()

  t.is(e.handlers().length, 0)
  t.false(e.handlers(true))

  t.end()
})
