/* eslint-env mocha */

import { expect } from 'chai'

import { MiniSignal, MiniSignalBinding } from '../src/mini-signals'

describe('MiniSignal', function tests () {
  'use strict'

  it('inherits when used with require(util).inherits', function () {
    class Beast extends MiniSignal { }

    var moop = new Beast()
    var meap = new Beast()

    expect(moop).to.instanceof(Beast)
    expect(meap).to.instanceof(MiniSignal)

    moop.handlers()
    meap.handlers()

    /* istanbul ignore next */
    moop.add(function () {
      throw new Error('I should not dispatch')
    })

    meap.dispatch('rawr')
    meap.detachAll()
  })

  it('quick test', function () {
    var pattern = []
    var e = new MiniSignal()

    var foo = e.add(writer, 'foo')
    e.add(writer, 'baz')
    var bar = e.add(writer, 'bar')

    expect(e).to.instanceof(MiniSignal)
    expect(foo).to.instanceof(MiniSignalBinding)

    e.dispatch('banana')
    e.dispatch('appple')

    foo.detach()
    bar.detach()

    e.dispatch('pear')

    e.detachAll()

    e.dispatch('raspberry')

    expect(pattern.join(';')).to.be.equal('foo:banana;baz:banana;bar:banana;foo:appple;baz:appple;bar:appple;baz:pear')

    function writer (a) {
      pattern.push(this + ':' + a)
    }
  })

  describe('MiniSignal#once', function () {
    let e, context

    beforeEach(function () {
      e = new MiniSignal()
      context = { bar: 'baz' }
    })

    it('should throw error for incorrect types', function () {
      expect(function () { e.once() }).throw('MiniSignal#once(): First arg must be a Function.')
      expect(function () { e.once(123) }).throw('MiniSignal#once(): First arg must be a Function.')
      expect(function () { e.once(true) }).throw('MiniSignal#once(): First arg must be a Function.')
      expect(e.handlers()).to.be.empty
    })

    it('should not invoke twice', function () {
      var cb = function (bar) {
        expect(bar).to.be.equal('bar')
        expect(this).to.be.equal(context)
        expect(arguments).to.have.lengthOf(1)
        e.dispatch('bar')
      }.bind(context)

      e.once(cb)

      e.dispatch('bar')
    })
  })

  describe('MiniSignal#add', function () {
    let e

    beforeEach(function () {
      e = new MiniSignal()
    })

    it('should throw error for incorrect types', function () {
      expect(function () { e.add() }).to.throw('MiniSignal#add(): First arg must be a Function.')
      expect(function () { e.add(123) }).to.throw('MiniSignal#add(): First arg must be a Function.')
      expect(function () { e.add(true) }).to.throw('MiniSignal#add(): First arg must be a Function.')
      expect(e.handlers()).to.be.empty
    })
  })

  describe('MiniSignal#dispatch', function () {
    function writer () {
      pattern += this
    }

    var e, context, pattern

    beforeEach(function () {
      e = new MiniSignal()
      context = { bar: 'baz' }
      pattern = ''
    })

    it('should return false when there are not events to dispatch', function () {
      expect(e.dispatch('foo')).to.equal(false)
      expect(e.dispatch('bar')).to.equal(false)
    })

    it('emits with context when function is bound function', function () {
      var cb = function (bar) {
        expect(bar).to.equal('bar')
        expect(this).to.equal(context)
        expect(arguments).to.have.lengthOf(1)
      }.bind(context)

      e.add(cb)

      e.dispatch('bar')
    })

    it('emits with context when context is specified', function () {
      e.add(function (bar) {
        expect(bar).to.equal('bar')
        expect(this).to.equal(context)
        expect(arguments).has.length(1)
      }, context)

      e.dispatch('bar')
    })

    it('can dispatch the function with multiple arguments', function () {
      for (var i = 0; i < 100; i++) {
        e = new MiniSignal();
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.add(function () {
            expect(arguments).to.have.lengthOf(args.length)
          })

          e.dispatch.apply(e, args)
        })(i)
      }
    })

    it('can dispatch the function with multiple arguments, multiple listeners', function () {
      for (var i = 0; i < 100; i++) {
        e = new MiniSignal();
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.add(function () {
            expect(arguments).to.have.lengthOf(args.length)
          })

          e.add(function () {
            expect(arguments.length).to.equal(args.length)
          })

          e.add(function () {
            expect(arguments.length).to.equal(args.length)
          })

          e.add(function () {
            expect(arguments.length).to.equal(args.length)
          })

          e.dispatch.apply(e, args)
        })(i)
      }
    })

    it('can dispatch many listeners', function () {
      var N = 10000
      var sum = 0

      function add (i) {
        sum += i
      }

      for (var i = 0; i <= N; i++) {
        e.add(add.bind(this, i))
      }

      e.dispatch()

      expect(sum).to.equal(N * (N + 1) / 2)
    })

    it('emits with context, multiple listeners (force loop)', function () {
      e.add(function (bar) {
        expect(this).to.deep.equal({ foo: 'bar' })
        expect(bar).to.equal('bar')
      }, { foo: 'bar' })

      e.add(function (bar) {
        expect(this).to.deep.equal({ bar: 'baz' })
        expect(bar).to.equal('bar')
      }, { bar: 'baz' })

      e.dispatch('bar')
    })

    it('emits with different contexts', function () {
      e.add(writer, 'foo')
      e.add(writer, 'baz')
      e.add(writer, 'bar')
      e.add(writer, 'banana')

      e.dispatch()
      expect(pattern).to.equal('foobazbarbanana')
    })

    it('should return true when there are events to dispatch', function (done) {
      e.add(function () {
        process.nextTick(done)
      })

      expect(e.dispatch()).to.be.true
    })

    it('should return false when there are no events to dispatch', function () {
      expect(e.dispatch()).to.be.false
    })

    it('receives the emitted events', function (done) {
      var e = new MiniSignal()

      e.add(function (a, b, c, d, undef) {
        expect(a).to.equal('foo')
        expect(b).to.equal(e)
        expect(c).to.be.instanceof(Date)
        expect(undef).to.equal(undefined)
        expect(arguments).to.have.lengthOf(3)

        done()
      })

      e.dispatch('foo', e, new Date())
    })

    it('emits to all event listeners', function () {
      var e = new MiniSignal()
      var pattern = []

      e.add(function () {
        pattern.push('foo1')
      })

      e.add(function () {
        pattern.push('foo2')
      })

      e.dispatch()

      expect(pattern.join(';')).to.equal('foo1;foo2')
    })

    it('emits to all event listeners', function () {
      var e = new MiniSignal()
      var pattern = []

      function foo1 () {
        pattern.push('foo1')
      }

      function foo2 () {
        pattern.push('foo2')
      }

      function foo3 () {
        pattern.push('foo3')
      }

      e.add(foo1)
      e.add(foo2)
      e.add(foo3)

      e.dispatch()

      expect(pattern.join(';')).to.equal('foo1;foo2;foo3')
    })

    it('emits to all event listeners, removes once', function () {
      var e = new MiniSignal()
      var pattern = []

      function foo1 () {
        pattern.push('foo1')
      }

      function foo2 () {
        pattern.push('foo2')
      }

      function foo3 () {
        pattern.push('foo3')
      }

      e.add(foo1)
      e.once(foo2)
      e.add(foo3)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).to.equal('foo1;foo2;foo3;foo1;foo3')
    })
  })

  describe('MiniSignal#handlers', function () {
    /* istanbul ignore next */
    function foo () {}

    it('returns an empty array if no handlers are added', function () {
      var e = new MiniSignal()

      expect(e.handlers()).to.be.instanceof(Array)
      expect(e.handlers().length).to.equal(0)
    })

    it('returns an array of MiniSignalBinding', function () {
      var e = new MiniSignal()

      e.add(foo)
      e.add(foo)
      expect(e.handlers()).to.be.instanceof(Array)
      expect(e.handlers().length).to.equal(2)
      e.handlers().forEach(function (h) {
        expect(h).to.be.instanceof(MiniSignalBinding)
      })
    })

    it('is not vulnerable to modifications', function () {
      var e = new MiniSignal()

      e.add(foo)
      e.add(foo)

      expect(e.handlers().length).to.equal(2)

      e.handlers().length = 0
      expect(e.handlers().length).to.equal(2)
      e.handlers().forEach(function (h) {
        expect(h).to.be.instanceof(MiniSignalBinding)
      })
    })

    it('can return a boolean as indication if handlers exist', function () {
      var e = new MiniSignal()

      e.add(foo)
      e.add(foo)
      e.add(foo)
      e.add(foo)
      e.add(foo)
      e.add(foo)

      expect(e.handlers(true)).to.equal(true)

      e.detachAll()

      expect(e.handlers(true)).to.equal(false)
    })
  })

  describe('MiniSignal#detach', function () {
    /* istanbul ignore next */
    function foo () {
      pattern.push('foo')
    }

    /* istanbul ignore next */
    function bar () {
      pattern.push('bar')
    }

    /* istanbul ignore next */
    function a () {
      pattern.push('a')
    }

    /* istanbul ignore next */
    function b () {
      pattern.push('b')
    }

    var e, pattern

    beforeEach(function () {
      e = new MiniSignal()
      pattern = []
    })

    it('should throw an error if not a SignalBinding', function () {
      expect(function () { e.detach() }).to.throw('MiniSignal#detach(): First arg must be a MiniSignalBinding object.')
      expect(function () { e.detach(1) }).to.throw('MiniSignal#detach(): First arg must be a MiniSignalBinding object.')
      expect(function () { e.detach(bar) }).to.throw('MiniSignal#detach(): First arg must be a MiniSignalBinding object.')
    })

    it('should only remove the event with the specified node', function () {
      e.add(a)
      e.add(b)
      var _bar = e.add(bar)

      expect(e.handlers().length).to.equal(3)
      e.dispatch()
      expect(pattern.join(';')).to.equal('a;b;bar')

      e.detach(_bar)
      expect(e.handlers().length).to.equal(2)

      e.dispatch()
      expect(pattern.join(';')).to.equal('a;b;bar;a;b')
    })

    it('should remove from front', function () {
      var _bar = e.add(bar)
      e.add(a)
      e.add(b)

      expect(e.handlers().length).to.equal(3)
      e.dispatch()
      expect(pattern.join(';')).to.equal('bar;a;b')

      e.detach(_bar)
      expect(e.handlers().length).to.equal(2)
      e.dispatch()
      expect(pattern.join(';')).to.equal('bar;a;b;a;b')
    })

    it('should remove from middle', function () {
      e.add(a)
      var _bar = e.add(bar)
      e.add(b)

      expect(e.handlers().length).to.equal(3)
      e.dispatch()
      expect(pattern.join(';')).to.equal('a;bar;b')

      e.detach(_bar)
      expect(e.handlers().length).to.equal(2)
      e.dispatch()
      expect(pattern.join(';')).to.equal('a;bar;b;a;b')
    })

    it('emits to all event listeners after removing', function () {
      e.add(a)
      var _foo = e.add(foo)
      e.add(b)

      e.detach(_foo)
      e.dispatch()

      expect(pattern.join(';')).to.equal('a;b')
    })

    it('can remove previous node in dispatch', function () {
      var _foo = e.add(foo)
      e.add(foo2)
      e.add(a)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).to.equal('foo;foo2;a;foo2;a')

      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }
    })

    it('can remove next node in dispatch', function () {
      e.add(a)
      e.add(foo2)
      var _foo = e.add(foo)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).to.equal('a;foo2;a;foo2')  // will remove node this dispatch (might be unexpected)

      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }
    })

    it('can remove node in dispatch', function () {
      e.add(foo2)
      e.add(a)
      var _foo = e.add(foo)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).to.equal('foo2;a;foo2;a')  // will remove node this dispatch (might be unexpected)

      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }
    })

    it('can remove current node in dispatch', function () {
      e.add(a)
      var _foo = e.add(foo2)
      e.add(b)

      e.dispatch()
      e.dispatch()

      expect(pattern.join(';')).to.equal('a;foo2;b;a;b')

      function foo2 () {
        pattern.push('foo2')
        e.detach(_foo)
      }
    })

    it('can only detach from same signal', function () {
      var e2 = new MiniSignal()

      var binding = e.add(foo)
      e2.detach(binding)
      expect(binding._owner).to.equal(e)
      expect(e.handlers(true)).to.be.true // !
    })

    it('can be called multiple times', function () {
      var binding = e.add(foo)
      expect(binding._owner).to.equal(e)
      e.detach(binding)
      expect(binding._owner).to.be.null
      e.detach(binding)
      e.detach(binding)
    })
  })

  describe('MiniSignal#detachAll', function () {
    /* istanbul ignore next */
    function oops () { throw new Error('oops') }

    var e

    beforeEach(function () {
      e = new MiniSignal()
    })

    it('removes all events', function () {
      e.add(oops)
      e.add(oops)
      e.add(oops)
      e.add(oops)

      expect(e.handlers().length).to.equal(4)

      expect(e.detachAll()).to.equal(e)
      expect(e.handlers().length).to.equal(0)

      expect(e.dispatch()).to.equal(false)
    })

    it('should not throw an error if no listerners are set', function () {
      expect(e.detachAll()).to.equal(e)
      expect(e.handlers().length).to.equal(0)

      expect(e.dispatch()).to.equal(false)
    })

    it('Should not throw error when calling detach after detachAll', function () {
      var binding = e.add(oops)
      e.detachAll()
      e.detach(binding)
    })
  })

  describe('MiniSignal#has', function () {
    /* istanbul ignore next */
    function oops () { throw new Error('oops') }

    var e

    beforeEach(function () {
      e = new MiniSignal()
    })

    it('has returns true if bound', function () {
      var binding = e.add(oops)
      expect(e.has(binding)).to.be.true
    })

    it('has returns false if bound to another signal', function () {
      var e2 = new MiniSignal()
      var binding = e2.add(oops)
      expect(e.has(binding)).to.be.false
    })

    it('has returns false if detached', function () {
      var binding = e.add(oops)
      expect(e.has(binding)).to.be.true
      binding.detach()
      expect(e.has(binding)).to.be.false
    })

    it('has returns false after detachAll', function () {
      var binding = e.add(oops)
      expect(e.has(binding)).to.be.true
      e.detachAll()
      expect(e.has(binding)).to.be.false
    })

    it('should throw error for incorrect types', function () {
      expect(function () { e.has({}) }).to.throw('MiniSignal#has(): First arg must be a MiniSignalBinding object.')
    })
  })

  describe('Readme Examples', function () {
    it('Example Usage', function () {
      var mySignal = new MiniSignal()

      var binding = mySignal.add(onSignal)   // add listener
      mySignal.dispatch('foo', 'bar')        // dispatch signal passing custom parameters
      binding.detach()                       // remove a single listener

      function onSignal (foo, bar) {
        expect(foo).to.equal('foo')
        expect(bar).to.equal('bar')
      }
    })

    it('Another Example', function () {
      var myObject = {
        foo: 'bar',
        updated: new MiniSignal()
      }

      myObject.updated.add(onUpdated, myObject)   // add listener with context

      myObject.foo = 'baz'
      myObject.updated.dispatch()                 // dispatch signal

      function onUpdated () {
        expect(this).to.equal(myObject)
        expect(this.foo).to.equal('baz')
      }
    })

    it('Function#bind example', function () {
      var mySignal = new MiniSignal()
      var context = {}

      var cb = function (bar) {
        expect(arguments).to.have.lengthOf(1)
        expect(bar).to.equal('bar')
        expect(this).to.equal(context)
      }.bind(context)

      mySignal.add(cb)

      mySignal.dispatch('bar')
    })

    it('Function#bind example with parameters', function () {
      var mySignal = new MiniSignal()
      var context = {}
      var cb = function (bar) {
        expect(arguments).to.have.lengthOf(1)
        expect(bar).to.equal('bar')
        expect(this).to.equal(context)
      }.bind(context, 'bar')

      mySignal.add(cb)

      mySignal.dispatch()
    })
  })
})
