/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.Observer.JS - An extension of the Pro.js core library that implements the observer design pattern to track object state,
and notify all subscribed listeners of changes in object's state. The extension utilizes an API similar to the native Object.observe method,
however, the extension has no dependencies on the native Object.observe method, and is completely cross-browser-compatible. The pro observer
is a highly optimized observer that doesn't have any performance impacts on application runtimes.
Author: Jacob Heater,
Dependencies: Pro.js,
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 *****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.observer', ['pro'], function (pro) {
    "use strict";
    var $diffTypes = {
        add: 'add',
        upd: 'update',
        del: 'delete'
    };
    var Observer = pro.$class('pro.Observer', function (obj, property, callback) {
        this.notify = (callback || property) || function () { };
        this.property = pro.isString(property) ? property : null;
        this.object = obj || {};
        this.hashTable = pro.getHashTable(this.object);
    });
    var ObjectChange = pro.$class('pro.Observer.ObjectChange', function (type, propertyName, originalValue, currentValue, obj) {
        this.type = type;
        this.propertyName = propertyName;
        this.object = obj;
        if (type === $diffTypes.add) {
            this.currentValue = originalValue;
            this.originalValue = originalValue;
            this.object = currentValue;
        } else if (type === $diffTypes.del) {
            this.originalValue = originalValue;
            this.currentValue = undefined;
            this.object = currentValue;
        } else {
            this.currentValue = currentValue;
            this.originalValue = originalValue;
        }
    });
    var Subject = pro.$class('pro.Subject', function () {
        var _subject = this;
        var _private = {
            index: [],
            interval: 75,
            diff: function () {
                var changes = [];
                for (var i = 0, len = this.index.length; i < len; i++) {
                    var o = this.index[i];
                    var then = o.hashTable;
                    var now = pro.getHashTable(o.object);
                    var diffMap = [];
                    if (now.length !== then.length) {
                        if (now.length > then.length) {
                            pro.$for(now, function (i, n) {
                                if (then.filter(function (t) {
                                    return t.key === n.key;
                                }).length <= 0) {
                                    diffMap.push(new ObjectChange($diffTypes.add, n.key, n.value, o.object));
                                }
                            });
                        } else if (now.length < then.length) {
                            pro.$for(then, function (i, t) {
                                if (now.filter(function (n) {
                                    return t.key === n.key;
                                }).length <= 0) {
                                    diffMap.push(new ObjectChange($diffTypes.del, t.key, t.value, o.object));
                                }
                            });
                        }
                    }
                    pro.$for(now, function (i, n) {
                        var match = then.filter(function (t) {
                            return t.key === n.key;
                        })[0];
                        if (match && match.value !== n.value && pro.toJson(match.value) !== pro.toJson(n.value)) {
                            diffMap.push(new ObjectChange($diffTypes.upd, n.key, match.value, n.value, o.object));
                        }
                    });
                    if (diffMap.length > 0) {
                        changes.push({
                            observer: o,
                            map: diffMap
                        });
                        o.hashTable = now;
                    }
                }
                return changes;
            },
            observe: function () {
                var $this = this;
                var doObserve = function () {
                    var changes = $this.diff();
                    if (changes.length > 0) {
                        for (var i = 0, len = changes.length; i < len; i++) {
                            var c = changes[i];
                            c.observer.notify(c.map);
                        }
                    }
                    if ($this.index.length > 0 && _subject.observing) {
                        $this.observe();
                    }
                };
                if (requestAnimationFrame) {
                    requestAnimationFrame(doObserve);
                } else {
                    setTimeout(doObserve, this.interval);
                }
            }
        };
        this.observers = {
            add: function (observer) {
                if (!this.contains(observer) && pro.isClass(observer) && observer.is(Observer)) {
                    _private.index.push(observer);
                    if (!_subject.observing) {
                        _subject.observing = true;
                        _private.observe();
                    }
                }
                return this;
            },
            remove: function (observer) {
                if (this.contains(observer)) {
                    _private.index.splice(_private.index.indexOf(observer), 1);
                    if (_private.index.length <= 0) {
                        _subject.observing = false;
                    }
                }
                return this;
            },
            clear: function () {
                _private.index.length = 0;
                _subject.observing = false;
            },
            contains: function (observer) {
                return _private.index.indexOf(observer) > -1;
            },
            findByObject: function (object) {
                return _private.index.filter(function (o) {
                    return o.object === object;
                })[0];
            }
        };
        this.observing = false;
        this.observe = function () {
            _private.observe();
            return this;
        };
    });
    var observerSubject = new Subject();
    pro.extend({
        /*@ Purpose: Uses an observer to track object state and notifies all listeners of changes in object state.
        @ Param: obj -> object: The object to observe.
        @ Param: property -> string: The name of a specific property to observe changes to. [Optional]
        @ Param: callback -> function: The handler to invoke on object state change. */
        observe: function (obj, property, callback) {
            var observer = new Observer(obj, property, callback);
            observerSubject.observers.add(observer);
            if (!observerSubject.observing) {
                observerSubject.observing = true;
                observerSubject.observe();
            }
            return obj;
        },
        /*@ Purpose: Removes all observers of the given object from the subject, given that the object has observers attached to it.
        @ Param: obj -> object: The object to detach observers from. */
        unobserve: function (obj) {
            if (arguments.length === 1) {
                while (observerSubject.observers.findByObject(obj) !== undefined) {
                    var observer = observerSubject.observers.findByObject(obj);
                    observerSubject.observers.remove(observer);
                }
                if (observerSubject.observers.length <= 0) {
                    observerSubject.observing = false;
                }
            } else if (arguments.length === 0) {
                observerSubject.observers.clear();
            }
            return obj;
        }
    });
    return pro;
});
