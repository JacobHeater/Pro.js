/*************************************************************
**************************************************************
**************************************************************
Pro.App.JS - An extension of the Pro.js core library. This extension allows
for the containerization of components in a page, where each container represents its own scope.
Each container houses a set of components that are responsible for an action in a view.
Depedencies: {
    Pro.js,
    Pro.Collections.js,
    Pro.Document.js,
    External Depedencies: {
        Require.js - http://requirejs.org/
    }
}
**************************************************************
**************************************************************
**************************************************************/
(function (pro) {
    var regex = {
        camelCase: /([a-z0-9_](?=[A-Z0-9_]))/g,
        input: /(input|textarea|select)/gi,
        fn: /function \([a-z0-9$_, ]+\)/gi
    };
    var constants = function () {
        return {
            attr: {
                bind: 'elem-bind',
                click: 'elem-click'
            }
        }
    };
    var buildComponents = function ($container, component, html) {
        var selector = component.name.replace(regex.camelCase, '$1 ').toLowerCase().split(' ').reduce(function (current, next, str) {
            return pro.stringFormatter('{0}-{1}', current, next);
        });
        var domElem = pro.document.create(html);
        var $components = pro.document.query(selector).select(function (elem) {
            return new $component($container, selector, component, domElem, elem);
        });
        return $components;
    };
    var buildControls = function ($component) {
        var controls = $component.domElem.find('[control]').select(function (c) {
            return new $control(c, $component);
        });
        controls.forEach(function (i, c) {
            $component.controls[c.name] = c;
        });
        bindControls(controls);
        wireControlEvents(controls);
    };
    var bindControls = function ($controls) {
        $controls.forEach(function (i, ctrl) {
            var elem = ctrl.elem;
            var bind = elem.attr(constants().attr.bind);
            if (bind) {
                ctrl.bind(bind);
            }
        });
    };
    var wireControlEvents = function ($controls) {
        $controls.forEach(function (i, ctrl) {
            var elem = ctrl.elem;
            var click = elem.attr(constants().attr.click);
            if (click) {
                ctrl.wireEvent('click', click);
            }
        });
    };
    var initializeComponent = function (component, $container) {
        pro.ajax({
            method: 'GET',
            cache: false,
            url: component.templateUrl
        }).success(function (html, req) {
            var $components = buildComponents($container, component, html);
            //This means that a depdendent component hasn't built yet. Defer building until later.
            if ($components.count() > 0) {
                $components.forEach(function (i, c) {
                    buildControls(c);
                    c.render();
                });
            } else {
                pro.asyncAction(function () {
                    initializeComponent(component, $container);
                });
            }
        }).error(function (xhr) {
            console.error(pro.stringFormatter("There was an error retrieving template for {{0}}. See request details: {1}.", templateUrl, xhr));
        });
    };
    var $container = pro.$class('pro.app.container', function (name, components) {
        var _components = new pro.collections.list(pro.isArray(components) ? components : []);
        var _models = new pro.collections.dictionary();
        var _controllers = new pro.collections.dictionary();
        var $container = this;
        this.name = name || "";
        this.component = function (path) {
            _components.add(path);
        };
        this.model = function (name, value) {
            if (name && value) {
                _models.add(name, value);
            } else {
                return _models.get(name);
            }
            return this;
        };
        this.controller = function (name, value) {
            if (name && value) {
                _controllers.add(name, value);
            } else {
                return _controllers.get(name);
            }
            return this;
        };
        this.initialize = function () {
            _components.forEach(function (i, component) {
                require([component], function (c) {
                    initializeComponent(c, $container);
                }, function (err) {
                    console.error(pro.stringFormatter('There was an error loading module: {{0}}. See error message: {1}', component, err));
                });
            });
        };
    });
    var $component = pro.$class('pro.app.component', function ($container, selector, component, domElem, $component) {
        var $this = this;
        var _rendered = false;
        var _component = component;
        var _controller = $component.attr('controller');
        var _model = $component.attr('model');
        var promise = new pro.promise();
        var modelPromise = new pro.promise();
        var buildDependencies = function (fn) {
            var dependencies = fn.toString().match(regex.fn);
            dependencies = dependencies !== null ? dependencies[0].split('(')[1].replace(/[\(\)]+/g, '').replace(/[, ]+/g, '|').split(/\|/g) : [];
            var _dependencies = pro.collections.asEnumerable(pro.isArray(dependencies) ? dependencies : []).select(function (dep) {
                return dep === "$component" ? $this : $utils[dep];
            }).toArray();
            return _dependencies;
        };
        var buildControllerSync = function () {
            if (_controller) {
                _controller = $container.controller(_controller);
                if (_controller) {
                    _controller = _controller.value;
                }
            }
            if (pro.isFunction(_controller)) {
                var dep = buildDependencies(_controller);
                dep = [_model].concat(dep);
                _controller = pro.applyConstructor(_controller, dep);
            } else if (pro.isString(_controller)) {
                buildModelAsync(function (_model) {
                    buildControllerAsync(_model);
                });
            }
        };
        var buildControllerAsync = function (_model, onComplete) {
            if (pro.isString(_controller)) {
                require([_controller], function (c) {
                    var dep = buildDependencies(c);
                    dep = [_model].concat(dep);
                    _controller = pro.applyConstructor(c, dep);
                    modelPromise.finalize();
                    promise.finalize();
                    modelPromise.beginCallstackInvocation(_model);
                    promise.beginCallstackInvocation(_controller);
                    if (pro.isFunction(onComplete)) {
                        onComplete.call(this, _controller);
                    }
                });
            }
        };
        var buildModelSync = function () {
            if (_model) {
                _model = $container.model(_model);
                if (_model) {
                    _model = _model.value;
                }
            }
            if (pro.isFunction(_model)) {
                var dep = buildDependencies(_model);
                _model = pro.applyConstructor(_model, dep);
            }
        };
        var buildModelAsync = function (onComplete) {
            if (pro.isString(_model)) {
                require([_model], function (c) {
                    var dep = buildDependencies(c);
                    _model = c;
                    if (pro.isFunction(onComplete)) {
                        onComplete.call(this, _model);
                    }
                });
            }
        };
        buildModelSync();
        buildControllerSync();
        this.container = $container;
        this.selector = selector || "";
        this.domElem = domElem;
        this.components = $component;
        this.controls = {};
        this.render = function () {
            this.components.where(function (c) {
                return !c.data('rendered');
            }).append(domElem).data('rendered', true);
            pro.recurseAsync(function () {
                var unrendered = pro.document.query($this.selector).where(function (c) {
                    return !c.data('rendered');
                });
                if (unrendered.count() > 0) {
                    unrendered.append(domElem).data('rendered', true).attr('rendered', true).addClass('rendered');
                }
                return unrendered.count() > 0 || $this.components.length <= 0;
            });
        };
        this.bind = function (control, property) {
            this.model().ready(function (m) {
                $binder(m, control, property).bind();
            });
        };
        this.wireEvent = function (control, event, property) {
            this.controller().ready(function (c) {
                $wirer(c, control, event, property).wire();
            });
        };
        this.model = function () {
            return {
                ready: function (action) {
                    if (!_model || pro.isString(_model)) {
                        modelPromise.pushToCallstack(action);
                    } else {
                        action(_model);
                    }
                    return this;
                }
            };
        };
        this.controller = function () {
            return {
                ready: function (action) {
                    if (!_controller || pro.isString(_controller)) {
                        promise.pushToCallstack(action);
                    } else {
                        action(_controller);
                    }
                    return this;
                }
            };
        };
    });
    var $control = pro.$class('pro.app.control', function (control, $component) {
        this.name = control.attr('control');
        this.elem = control;
        this.component = $component;
        this.bind = function (property) {
            this.component.bind(this, property);
        };
        this.wireEvent = function (event, property) {
            this.component.wireEvent(this, event, property);
        };
    });
    var $binder = function (model, control, property) {
        return {
            bind: function () {
                var tagName = control.elem.attr('tagName');
                var isInput = (tagName.match(regex.input) || []).length > 0;
                var updateControl = function (value) {
                    if (isInput) {
                        control.elem.value(value || "");
                    } else {
                        control.elem.text(value || "");
                    }
                };
                control.elem.on('propertychange change click keyup input paste', function (e, d, $d) {
                    var value = isInput ? $d.value() : $d.text();
                    model[property] = value;
                });
                updateControl(model[property]);
                /*****************************************
                ******************************************
                Experimental Two-way Data binding feature
                ******************************************
                ******************************************/
                pro.observe(model, property, function (c) {
                    updateControl(model[property]);
                });
            }
        };
    };
    var $wirer = function (controller, control, event, property) {
        return {
            wire: function () {
                control.elem.on(event, controller[property]);
            }
        };
    };
    var $utils = {
        $wirer: $wirer,
        $binder: $binder
    };
    pro.module('app', pro.object({
        container: function (name, modules) {
            return new $container(name, modules);
        }
    }));
})(pro);