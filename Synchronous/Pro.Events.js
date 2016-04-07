(function (pro) {
    pro.module('events', pro.object({
        eventArguments: pro.$class('pro.events.eventArguments', function(event, init) {
            if (pro.isObject(init)) {
                pro.extend(this, init);
            }
            this.event = event.name || null;
        }),
        event: pro.$class('pro.events.event', function (name) {
            var listeners = new pro.collections.list();
            this.name = name || "";
            this.addListener = function (listener) {
                if (pro.isFunction(listener)) {
                    listeners.add(listener);
                }
            };
            this.removeListener = function (listener) {
                listeners.remove(listener);
            };
            this.fire = function (args) {
                listeners.forEach(function (i, o) {
                    o.call(this, args);
                });
            };
        })
    }));
})(pro);
