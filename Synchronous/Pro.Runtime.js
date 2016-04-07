(function (pro) {
    "use strict";
    var _private = {
        exceptions: {
            invalidProcedureException: pro.$class('pro.runtime.invalidProcedureException << pro.exception', function () {
                var message = 'The callstack expects type of "pro.runtime.procedure" to be added to the callstack.';
                this.initializeBase(message, new Error(message));
                return this;
            }, pro.exception)
        },
        callstack: pro.$class('pro.runtime.callstack << pro.collections.stack', function (init) {
            var renderEnumerable = function (enumerable) {
                return new _private.callstack(enumerable);
            };
            this.initializeBase(init || []);
            this.overrides = {
                add: 'add'
            };
            this.add = function (procedure) {
                if (pro.isClass(procedure) && procedure.is(pro.runtime.procedure)) {
                    this.base.add(procedure);
                } else {
                    throw new _private.exceptions.invalidProcedureException();
                }
                return this;
            };
        }, pro.collections.stack)
    };
    pro.module('runtime', pro.object({
        main: function () {
            if (pro.isClass(this.callstack) && this.callstack.is(_private.callstack)) {
                while (this.callstack.count() > 0) {
                    var proc = this.callstack.pop();
                    proc.fn.apply(this, proc.args);
                }
            }
        },
        callstack: new _private.callstack(),
        procedure: pro.$class('pro.runtime.procedure', function (fn, args) {
            this.fn = function () { };
            this.args = [];
            if (pro.isFunction(fn)) {
                this.fn = fn;
            }
            if (pro.isArray(args)) {
                this.args = args;
            }
            return this;
        }),
        errorHandling: {
            breakOnExceptions: false,
            logExceptions: true
        }
    }));
    setTimeout(function () {
        pro.runtime.main();
    }, 0);
})(pro);
