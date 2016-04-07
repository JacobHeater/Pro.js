(function (pro) {
    pro.document.module('modules', pro.object({
        container: pro.$class('pro.document.modules.container', function (name) {
            var $container = this;
            this.modules = new pro.collections.list();
            this.moduleInstances = new pro.collections.list();
            this.getModule = function (name) {
                return this.modules.where(function (module) {
                    return module.name === name;
                }).first();
            };
            this.dispose = function () {
                this.moduleInstances.forEach(function (i, m) {
                    m.dispose();
                });
            };
            this.initializeContainer = function () {
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
                pro.document.ready(function () {
                    if ($this.modules.count() > 0) {
                        $this.modules.forEach(function (i, module) {
                            m$ = new module();
                            url = m$.templateUrl;
                            elems = pro.document.query(m$.getSelector());
                            head = pro.document.query('head');
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
                                    return pro.document.create(pro.stringFormatter('<script src="{0}"></script>', path))[0];
                                });
                                eventHandlers.forEach(function (i, script) {
                                    head.append(script);
                                });
                            });
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
                                    scripts = pro.collections.asEnumerable($el.attr('scripts').split(';')).where(function (str) {
                                        return str.trim() !== "";
                                    }).select(function (str) {
                                        path = m.dependencies.scripts.where(function (s) {
                                            return s.name === str;
                                        }).select(function (s) {
                                            return s.path;
                                        }).first();
                                        return pro.document.create(pro.stringFormatter('<script src="{0}"></script>', path))[0];
                                    });
                                    styles = pro.collections.asEnumerable($el.attr('styles').split(';')).where(function (str) {
                                        return str.trim() !== "";
                                    }).select(function (str) {
                                        path = m.dependencies.styles.where(function (s) {
                                            return s.name === str;
                                        }).select(function (s) {
                                            return s.path;
                                        }).first();
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
                                    ctrls = created.find('[module-control]');
                                    ctrls.forEach(function (i, ctrl) {
                                        $ctrl = pro.document.query(ctrl);
                                        $ctrl.module = m;
                                        ctrlNm = $ctrl.attr('module-control');
                                        m.controls[ctrlNm] = $ctrl;
                                    });
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
                                console.log(pro.stringFormatter("Error loading module {0}", m.name));
                            });
                        });
                    }
                });
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
            this.beforeDestroy = new pro.events.event('beforeDestroy');
            this.afterDestroy = new pro.events.event('afterDestroy');
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
                this.beforeDestroy.fire(new pro.events.eventArguments(this.beforeDestroy, {
                    module: this
                }));
                disposeControls();
                disposeResources();
                this.afterDestroy.fire(new pro.events.eventArguments(this.afterDestroy, {
                    module: this
                }));
            };
            this.container = null;
            this.dependencies = {
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