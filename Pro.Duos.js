define('pro.duos', ['pro', 'collections'], function (pro, collections) {
    "use strict";
    pro.module('duos', pro.object({
        extend: pro.extend,
        container: pro.factory(pro.$class('pro.duos.container', function (name) {
            var $this = this;
            this.name = name;
            this.controllers = new collections.list();
            this.init = function () {
                pro.document.ready(function (e) {
                    var containerElem = pro.document.query('[pro-app]');
                    if ($this.controllers.count() > 0) {
                        var controllers = containerElem.find('[pro-controller]');
                        if (controllers.length > 0) {
                            controllers.forEach(function (i, c) {
                                c = pro.document.query(c);
                                var name = c.attr('pro-controller');
                                var binds = c.find('[pro-bind]');
                                var ctrlInstance = $this.controllers.where(function (c) {
                                    return c.name === name
                                }).first();
                                if (ctrlInstance) { }
                            });
                        }
                    }
                });
            };
            return this;
        })),
        controller: pro.factory(pro.$class('pro.duos.controller', function (name, implementation) {
            this.name = name;
            this.instance = {};
            if (pro.isFunction(implementation)) {
                var instance = new implementation();
                pro.extend(this.instance, instance);
            }
            return this;
        }))
    }));
});