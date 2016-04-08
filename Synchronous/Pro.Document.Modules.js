(function (pro) {
    pro.document.module('modules', pro.object({
        container: pro.$class('pro.document.modules.container', function (name, registry) {
            var $container = this;
            var _modules = new pro.collections.list();
            var _registry = pro.isArray(registry) ? new pro.collections.list(registry) : new pro.collections.list();
            this.modules = {
                registry: {
                    resources: {
                        eventHandlers: new pro.collections.typedList(pro.document.modules.moduleDependency),
                        scripts: new pro.collections.typedList(pro.document.modules.moduleDependency),
                        styles: new pro.collections.typedList(pro.document.modules.moduleDependency)
                    },
                    add: function (definition) {
                        _registry.add(definition);
                    },
                    remove: function (name) {
                        var match = _registry.where(function (r) {
                            return r.name === name;
                        }).first();
                        if (match) {
                            _registry.remove(match);
                        }
                    }
                },
                add: function (modules) {
                    if (pro.isArray(modules) || pro.isEnumerable(modules)) {
                        _modules.addRange(modules);
                    } else if (modules) {
                        _modules.add(modules);
                    }
                },
                remove: function (name) {
                    var match = this.getModule(name);
                    if (match) {
                        _modules.remove(match);
                    }
                }
            };
            this.moduleInstances = new pro.collections.list();
            this.getModule = function (name) {
                return _modules.where(function (module) {
                    return module.name === name;
                }).first();
            };
            this.dispose = function () {
                this.moduleInstances.forEach(function (i, m) {
                    m.dispose();
                });
            };
            this.initialize = function () {
                var $this = this;
                var elems;
                var $el;
                var scripts;
                var eventHandlers;
                var styles;
                var head;
                var path;
                var m;
                var m$;
                var url;
                var created;
                var ctrls;
                var $ctrl;
                var ctrlNm;
                //Load global registry modules into script definitions for container
                var loadRegistry = function (complete) {
                    if (_registry.count() > 0) {
                        _registry.forEach(function (i, r) {
                            r.require($container);
                        });
                        if (complete) {
                            complete();
                        }
                    }
                };
                //Load container modules and associate with their placeholders
                var loadModules = function () {
                    head = pro.document.query('head');
                    if (_modules.count() > 0) {
                        _modules.forEach(function (i, module) {
                            m$ = new module();
                            //Initialize global resources for modules
                            m$.dependencies.global.scripts.select(function (script) {
                                return pro.document.create(pro.stringFormatter('<script src="{0}"></script>', script.path));
                            }).forEach(function (i, script) {
                                head.append(script);
                            });
                            m$.dependencies.global.styles.select(function (style) {
                                return pro.document.create(pro.stringFormatter('<link rel="stylesheet" href="{0}" />', style.path));
                            }).forEach(function (i, style) {
                                head.append(style);
                            });
                            //Continue with module initialization
                            url = m$.templateUrl;
                            elems = pro.document.query(m$.getSelector());
                            //Initialize event handlers for each module.
                            elems.forEach(function (i, elem) {
                                m = new module();
                                m.container = $container;
                                $el = pro.document.query(elem);
                                $container.moduleInstances.add(m);
                                $el.attr('module', m);
                                eventHandlers = pro.collections.asEnumerable($el.attr('eventHandlers').split(';')).where(function (str) {
                                    return str !== "";
                                }).select(function (str) {
                                    var path = m.dependencies.eventHandlers.where(function (s) {
                                        return s.name === str;
                                    }).select(function (s) {
                                        return s.path;
                                    }).first();
                                    if (!path) {
                                        path = $container.modules.registry.resources.eventHandlers.where(function (s) {
                                            return s.name === str;
                                        }).select(function (s) {
                                            return s.path;
                                        }).first();
                                    }
                                    return pro.document.create(pro.stringFormatter('<script src="{0}"></script>', path))[0];
                                });
                                eventHandlers.forEach(function (i, script) {
                                    head.append(script);
                                });
                            });
                            //Retrieve the templates for each module defined in the view.
                            pro.ajax({
                                method: 'GET',
                                url: url
                            }).success(function (html) {
                                m = new module()
                                elems = pro.document.query(m.getSelector());
                                elems.forEach(function (i, el) {
                                    $el = pro.document.query(el);
                                    m = $el.attr('module');
                                    m.onRetrieveTemplate.fire(new pro.events.eventArguments(m.onRetrieveTemplate, {
                                        html: html,
                                        module: m
                                    }));
                                    //Load the scripts for the module instance
                                    scripts = pro.collections.asEnumerable($el.attr('scripts').split(';')).where(function (str) {
                                        return str.trim() !== "";
                                    }).select(function (str) {
                                        path = m.dependencies.scripts.where(function (s) {
                                            return s.name === str;
                                        }).select(function (s) {
                                            return s.path;
                                        }).first();
                                        if (!path) {
                                            path = $container.modules.registry.resources.scripts.where(function (s) {
                                                return s.name === str;
                                            }).select(function (s) {
                                                return s.path;
                                            }).first();
                                        }
                                        return pro.document.create(pro.stringFormatter('<script src="{0}"></script>', path))[0];
                                    });
                                    //Load the styles for the module instance
                                    styles = pro.collections.asEnumerable($el.attr('styles').split(';')).where(function (str) {
                                        return str.trim() !== "";
                                    }).select(function (str) {
                                        path = m.dependencies.styles.where(function (s) {
                                            return s.name === str;
                                        }).select(function (s) {
                                            return s.path;
                                        }).first();
                                        if (!path) {
                                            path = $container.modules.registry.resources.styles.where(function (s) {
                                                return s.name === str;
                                            }).select(function (s) {
                                                return s.path;
                                            }).first();
                                        }
                                        return pro.document.create(pro.stringFormatter('<link href="{0}" rel="stylesheet" />', path))[0];
                                    });
                                    scripts.forEach(function (i, script) {
                                        head.append(script);
                                    });
                                    styles.forEach(function (i, style) {
                                        head.append(style);
                                    });
                                    m.onLoad.fire(new pro.events.eventArguments(m.onLoad, {
                                        module: m
                                    }));
                                    created = pro.document.create(html);
                                    //Find the member controls of the newly loaded template
                                    ctrls = created.find('[module-control]');
                                    //Append the controls to the module instance controls object
                                    ctrls.forEach(function (i, ctrl) {
                                        $ctrl = pro.document.query(ctrl);
                                        $ctrl.module = m;
                                        ctrlNm = $ctrl.attr('module-control');
                                        m.controls[ctrlNm] = $ctrl;
                                    });
                                    //Append the loaded template to the instance placeholder.
                                    $el.append(created);
                                    m.onAppendTemplate.fire(new pro.events.eventArguments(m.onAppendTemplate, {
                                        html: html,
                                        module: m,
                                        targetDomElement: $el
                                    }));
                                    m.loadComplete.fire(new pro.events.eventArguments(m.loadComplete, {
                                        module: m,
                                        targetDomElement: $el
                                    }));
                                });
                            }).error(function (xhr) {
                                console.log(pro.stringFormatter("Error loading module {0}", m$.name));
                            });
                        });
                    }
                };
                if (!pro.document.isLoaded()) {
                    //pro.document.complete(loadModules);
                    loadRegistry(function () {
                        pro.document.complete(loadModules);
                    });
                } else {
                    var tries = 0;
                    var pingBack = function (time) {
                        loadRegistry();
                        if (_modules.count() <= 0 && tries < 100) {
                            setTimeout(function () {
                                pingBack(time + 5);
                                tries = tries + 1;
                            }, time);
                        } else {
                            loadModules();
                        }
                    };
                    pingBack(0);
                }
            };
        }),
        moduleDefinition: pro.$class('pro.document.modules.moduleDefintion', function (name, path, require) {
            var $definition = this;
            this.name = name || "";
            this.path = path || "";
            this.require = function ($container) {
                if (pro.isFunction(require)) {
                    if (!pro.document.isLoaded()) {
                        pro.document.ready(function () {
                            var head = pro.document.query('head');
                            head.append(pro.document.create(pro.stringFormatter('<script src="{0}" module-name="{1}"></script>', $definition.path, $definition.name)));
                        });
                        pro.document.complete(function () {
                            require.call(window, $container);
                        });
                    } else {
                        var head = pro.document.query('head');
                        head.append(pro.document.create(pro.stringFormatter('<script src="{0}" module-name="{1}"></script>', $definition.path, $definition.name)));
                        setTimeout(function () {
                            require.call(window, $container);
                        }, 0);
                    }
                    
                }
            };
        }),
        moduleDependency: pro.$class('pro.document.modules.moduleDependency', function (name, path) {
            this.name = name || "";
            this.path = path || "";
        }),
        webModule: pro.$class('pro.document.modules.webModule', function (templateUrl, name) {
            var $module = this;
            this.onLoad = new pro.events.event('onLoad');
            this.loadComplete = new pro.events.event('loadComplete');
            this.onRetrieveTemplate = new pro.events.event('onRetrieveTemplate');
            this.onAppendTemplate = new pro.events.event('onAppendTemplate');
            this.beforeDispose = new pro.events.event('beforeDispose');
            this.afterDispose = new pro.events.event('afterDispose');
            this.templateUrl = templateUrl || "";
            this.internalId = pro.GUID.create();
            this.name = name || "";
            this.controls = {};
            var disposeControls = function () {
                for (var ctrl in $module.controls) {
                    $module.controls[ctrl].dispose();
                }
            };
            var cleanPath = function (path) {
                return path.replace('..', '');
            };
            var disposeResources = function () {
                $module.dependencies.eventHandlers.forEach(function (i, dep) {
                    var scripts = pro.document.query('script').where(function (s) {
                        return s.attr('src').indexOf(cleanPath(dep.path)) > -1;
                    });
                    scripts.dispose();
                });
                $module.dependencies.scripts.forEach(function (i, dep) {
                    var scripts = pro.document.query('script').where(function (s) {
                        return s.attr('src').indexOf(cleanPath(dep.path)) > -1;
                    });
                    scripts.dispose();
                });
                $module.dependencies.styles.forEach(function (i, dep) {
                    var styles = pro.document.query('link').where(function (s) {
                        return s.attr('href').indexOf(cleanPath(dep.path)) > -1;
                    });
                    styles.dispose();
                });
            };
            this.dispose = function () {
                this.beforeDispose.fire(new pro.events.eventArguments(this.beforeDestroy, {
                    module: this
                }));
                disposeControls();
                disposeResources();
                this.afterDispose.fire(new pro.events.eventArguments(this.afterDestroy, {
                    module: this
                }));
            };
            this.container = null;
            this.dependencies = {
                global: {
                    scripts: new pro.collections.typedList(pro.document.modules.moduleDependency),
                    styles: new pro.collections.typedList(pro.document.modules.moduleDependency)
                },
                eventHandlers: new pro.collections.typedList(pro.document.modules.moduleDependency),
                styles: new pro.collections.typedList(pro.document.modules.moduleDependency),
                scripts: new pro.collections.typedList(pro.document.modules.moduleDependency)
            };
            this.getSelector = function () {
                return this.name.replace(/([a-z0-9_](?=[A-Z0-9_]))/g, '$1 ').toLowerCase().split(' ').reduce(function (current, next) {
                    return pro.stringFormatter("{0}-{1}", current, next);
                });
            };
        })
    }));
})(pro);