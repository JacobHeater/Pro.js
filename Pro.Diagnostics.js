(function(pro) {
    pro.module('diagnostics', pro.object({
        stopwatch: pro.$class('pro.diagnostics.stopwatch', function() {
            var _sw = this;
            var milliseconds = 0;
            var id = pro.GUID.create();
            var timerLen = 10;
            var increment = 10;
            var calculate = function() {
                _sw.elapsed = pro.object({
                    milliseconds: milliseconds,
                    seconds: Math.floor(milliseconds / 1000),
                    minutes: Math.floor(Math.floor(milliseconds / 1000) / 60),
                    hours: Math.floor(Math.floor(Math.floor(milliseconds / 1000) / 60) / 60)
                });
            };
            var waitCall = function() {
                milliseconds += (increment + 1);
                setTimeout(function() {
                    if(_sw.started === true) {
                        waitCall();
                    }
                }, timerLen);
            };
            var timerCode;
            this.started = false;
            this.start = function() {
                this.started = true;
                waitCall();
                return this;
            };
            this.stop = function() {
                this.started = false;
                calculate();
                return this;
            };
            this.reset = function() {
                this.started = false;
                this.elapsed = null;
                milliseconds = 0;
                return this;
            };
            this.elapsed = null;
        })
    }));
    pro.diagnostics.extend = pro.extend;
})(pro);
