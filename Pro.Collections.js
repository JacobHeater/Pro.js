/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.Collections.JS - An extension of the Pro.JS library that offers
a high-level abstraction of collections that work off of native JavaScript arrays.
The common pro.collections.enumerable interface provides a standarized API
similar to C#'s LINQ API for manipulating datasets in JS arrays.,
Author: Jacob Heater,
Dependencies: Pro.JS,
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 ****************************************************************************
 *****************************************************************************
 *****************************************************************************/
define('pro.collections', ['pro'], function(pro) {
    "use strict";
    pro.module('collections', pro.object({
        extend: pro.extend,
        enumerable: pro.$class('pro.collections.enumerable', function (array, config) {
            var copy = array || [],
              $this = this,
              renderEnumerable = function (_array_) {
                  return pro.collections.asEnumerable(_array_);
              },
              indexer = 0,
              settings = pro.extend({
                  output: function (e) {
                      return e;
                  },
                  where: {
                      cast: function (e) {
                          return e;
                      },
                      output: null
                  },
                  select: {
                      cast: function (e) {
                          return e;
                      },
                      output: null
                  }
              }, config || {});
            if (pro.isObject(copy) && !pro.isArray(copy) && !pro.canEnumerate(copy) && !pro.isEnumerable(copy)) {
                var _temp = [];
                pro.enumerateObject(copy, function (key, value) {
                    var keyValuePair = new pro.keyValuePair(key, value);
                    _temp.push(keyValuePair);
                });
                copy = _temp;
            } else if (pro.isEnumerable(copy)) {
                var _temp = [].concat(copy.toArray());
                copy = _temp;
            } else if (pro.isReadOnlyArray(copy)) {
                var _temp = Array.apply(this, copy);
                copy = _temp;
            } else if (pro.canEnumerate(copy)) {
                var _temp = [];
                pro.$for(copy, function (index, value) {
                    _temp.push(value);
                });
                copy = _temp;
            }
            this.createEnumerable = function (collection) {
                return renderEnumerable(collection);
            };
            this.concat = function (collection) {
                var arr = this.toArray();
                if (pro.isClass(collection) && collection.is(pro.collections.enumerable)) {
                    arr = arr.concat(collection.toArray());
                } else if (pro.isArray(collection)) {
                    arr = arr.concat(collection);
                }
                var n = renderEnumerable(arr);
                return settings.output(n);
            };
            this.concatTo = function (enumerable) {
                if (pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) {
                    enumerable = enumerable.concat(this);
                }
                return enumerable;
            };
            this.where = function (predicate) {
                var worker = [],
                  fn = pro.isFunction(predicate) ? predicate : function () {
                      return false;
                  };
                this.forEach(function (i, value) {
                    if (fn.call(this, settings.where.cast(value)) === true) {
                        worker.push(value);
                    }
                });
                var n = renderEnumerable(worker);
                return pro.isFunction(settings.where.output) ? settings.where.output(n) : settings.output(n);
            };
            this.orderBy = function (predicate) {
                var worker = copy,
                  fn = pro.isFunction(predicate) ? predicate : function () {
                      return false;
                  },
                  sorted,
                  direction = arguments[1],
                  _this = this;
                if (pro.isString(direction) && pro.isString(predicate)) {
                    if (direction === 'ascending' || direction === 'asc') {
                        sorted = worker.sort(function (a, b) {
                            var aValue = a[predicate];
                            var bValue = b[predicate];
                            if (pro.isDefined(aValue) && pro.isDefined(bValue)) {
                                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                            }
                            return 0;
                        });
                    } else if (direction === 'descending' || direction === 'desc') {
                        sorted = worker.sort(function (a, b) {
                            var aValue = a[predicate];
                            var bValue = b[predicate];
                            if (pro.isDefined(aValue) && pro.isDefined(bValue)) {
                                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                            }
                            return 0;
                        });
                    }
                } else {
                    sorted = worker.sort(function (a, b) {
                        predicate.call(_this, a, b);
                    });
                }
                var n = renderEnumerable(sorted);
                return settings.output(n);;
            };
            this.groupBy = function (predicate) {
                var worker = copy,
                  fn = pro.isFunction(predicate) ? predicate : function () { },
                  groups = [];
                this.forEach(function (i, item) {
                    if (groups.length === 0) {
                        groups.push([item]);
                    } else {
                        var query = pro.collections.asEnumerable(groups).where(function (g) {
                            return pro.collections.asEnumerable(g).where(function (inner) {
                                return fn.call(this, inner) === fn.call(this, item);
                            }).count() > 0;
                        });
                        if (query.count() === 1) {
                            query.first().push(item);
                        } else {
                            groups.push([item]);
                        }
                    }
                });
                groups.asEnumerable = function () {
                    return pro.collections.asEnumerable(this).select(function (inner) {
                        return pro.collections.asEnumerable(inner);
                    });
                };
                var n = renderEnumerable(groups);
                return settings.output(n);
            };
            this.contains = function (item) {
                return this.indexOf(item) > -1;
            };
            this.take = function (count, endIndex) {
                var worker = copy,
                  base = pro.isNumber(count) ? count : 0,
                  trimmed = pro.isDefined(endIndex) ? worker.slice(base, endIndex) : worker.slice(0, base);
                var n = renderEnumerable(trimmed);
                return settings.output(n);
            };
            this.skip = function (count) {
                var worker = copy;
                var skipped;
                if (pro.isNumber(count) && count < worker.length) {
                    skipped = worker.slice(count, worker.length);
                } else {
                    skipped = worker;
                }
                var n = renderEnumerable(skipped);
                return settings.output(n);
            };
            this.select = function (selector) {
                var worker = [],
                  fn = pro.isFunction(selector) ? selector : function () {
                      return false;
                  };
                this.forEach(function (i, value) {
                    var selected = fn.call(this, settings.select.cast(value));
                    if (pro.isDefined(selected)) {
                        worker.push(selected);
                    }
                });
                var n = renderEnumerable(worker);
                return pro.isFunction(settings.select.output) ? settings.select.output(n) : settings.output(n);
            };
            this.stringify = function (separator) {
                return this.toArray().join(separator || '');
            };
            this.distinct = function () {
                var worker = new pro.collections.list();
                this.forEach(function (i, value) {
                    var match = worker.where(function (item) {
                        if (pro.isObject(value) && pro.isObject(item)) {
                            var itemJson = pro.toJson(item);
                            var valueJson = pro.toJson(value);
                            var blankJson = "{}";
                            if (itemJson !== blankJson && valueJson !== blankJson) {
                                return itemJson === valueJson;
                            }
                            return item === value;
                        }
                        return pro.areEqual(item, value);
                    }).first();
                    if (!pro.isDefined(match)) {
                        worker.add(value);
                    }
                });
                var n = renderEnumerable(worker.toArray());
                return settings.output(n);
            };
            this.first = function (filter) {
                if (pro.isFunction(filter)) {
                    return this.where(filter).atIndex(0);
                }
                return this.atIndex(0);
            };
            this.count = function () {
                return copy.length;
            };
            this.last = function (filter) {
                if (pro.isFunction(filter)) {
                    var filtered = this.where(filter);
                    return filtered.atIndex(filtered.count() - 1);
                }
                return this.atIndex(this.count() - 1);
            };
            this.reverse = function () {
                var n = renderEnumerable(copy.reverse());
                return settings.output(n);
            };
            this.atIndex = function (index) {
                var result = null;
                if (pro.isNumber(index)) {
                    result = copy[index];
                }
                return result;
            };
            this.indexOf = function (obj) {
                return copy.indexOf(obj);
            };
            this.toArray = function () {
                return copy.slice(0);
            };
            this.flatten = function () {
                var n = renderEnumerable(pro.flattenArray(copy));
                return settings.output(n);
            };
            this.toList = function () {
                var n = new pro.collections.list(this.toArray());
                return n;
            };
            this.toTypedList = function (T) {
                if (!pro.isFunction(T)) {
                    throw new Error('Argument "T" must be a function to identify the prototype.');
                }
                return new pro.collections.typedList(T, this.toArray());
            };
            this.toDictionary = function (keySelector) {
                var worker = [];
                if (pro.isFunction(keySelector)) {
                    this.forEach(function (i, item) {
                        var key = keySelector.call(this, item),
                          value = item,
                          keyValuePair = new pro.keyValuePair(key, value);
                        worker.push(keyValuePair);
                    });
                } else {
                    this.forEach(function (i, item) {
                        if (pro.areDefined(item, item.key, item.value)) {
                            worker.push(new pro.keyValuePair(item.key, item.value));
                        }
                    });
                }
                var n = new pro.collections.dictionary(worker);
                return n;
            };
            this.toStack = function () {
                var n = new pro.collections.stack(this.toArray());
                return n;
            };
            this.toQueue = function () {
                var n = new pro.collections.queue(this.toArray());
                return n;
            };
            this.add = function (item) {
                if (arguments.length === 1) {
                    copy.push(item);
                } else if (arguments.length > 1) {
                    copy = this.addRange.apply(this, arguments).toArray();
                }
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.addRange = function (enumerable) {
                if ((pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) || pro.isArray(enumerable)) {
                    pro.collections.asEnumerable(enumerable).forEach(function (i, o) {
                        copy.push(o);
                    });
                } else if (pro.isReadOnlyArray(enumerable)) {
                    this.addRange(pro.collections.asEnumerable(Array.apply(this, enumerable)));
                } else if (arguments.length > 1) {
                    this.addRange(arguments);
                }
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.remove = function (item) {
                var $this = this;
                var doRemove = function (item) {
                    var index = $this.indexOf(item);
                    if (index > -1) {
                        copy.splice(index, 1);
                    }
                };
                if (arguments.length === 1) {
                    doRemove(item);
                } else if (arguments.length > 1) {
                    pro.$for(arguments, function (i, o) {
                        doRemove(o);
                    });
                }
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.removeRange = function (enumerable) {
                var $this = this;
                if ((pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) || pro.isArray(enumerable)) {
                    pro.collections.asEnumerable(enumerable).forEach(function (i, o) {
                        $this.remove(o);
                    });
                } else if (pro.isReadOnlyArray(enumerable)) {
                    this.removeRange(pro.collections.asEnumerable(Array.apply(this, enumerable)));
                } else if (arguments.length > 1) {
                    this.removeRange(arguments);
                }
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.forEach = function (action) {
                var fn = pro.isFunction(action) ? action : function () { };
                var _this = this;
                pro.$for(copy, function (i, o) {
                    fn.call(_this, i, o);
                });
                return this;
            };
            this.current = function () {
                return this.atIndex(indexer);
            };
            this.next = function () {
                indexer = (indexer + 1) < this.count() ? indexer + 1 : this.count();
                return this;
            };
            this.previous = function () {
                indexer = (indexer - 1) > 0 ? indexer - 1 : indexer;
                return this;
            };
            this.reset = function () {
                indexer = 0;
                return this;
            };
            this.getIndex = function () {
                return indexer;
            };
            this.canEnumerate = function () {
                return indexer < this.count();
            };
            this.copyTo = function (target) {
                var copy = pro.copyArray($this.toArray(), target);
                var n = pro.collections.asEnumerable(copy);
                return settings.output(n);
            };
            this.clear = function () {
                copy.length = 0;
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.chunk = function (chunkSize) {
                var currentIndex = 0;
                var chunkCount = (pro.isNumber(chunkSize) && chunkSize > 0) ? chunkSize : 5;
                var chunkContainer = new pro.collections.list();
                while (currentIndex < this.count()) {
                    chunkContainer.add(this.take(currentIndex, currentIndex + chunkCount).toArray());
                    currentIndex += chunkCount;
                }
                var n = chunkContainer;
                return settings.output(n);
            };
            this.clone = function () {
                var _arr = this.toArray();
                var _copy = _arr.slice(0);
                var n = renderEnumerable(_copy);
                return settings.output(n);
            };
            this.scramble = pro.object({
                random: function () {
                    var _randomCopy = copy.slice(0);
                    _randomCopy = pro.collections.array.scramble.random(_randomCopy);
                    var n = renderEnumerable(_randomCopy);
                    return settings.output(n);
                },
                calculated: function (seed) {
                    var _calcCopy = copy.slice(0);
                    _calcCopy = pro.collections.array.scramble.calculated(_calcCopy, seed);
                    var n = renderEnumerable(_calcCopy);
                    return settings.output(n);
                }
            });
            this.set = function (index, value) {
                if (copy[index]) {
                    copy[index] = value;
                }
                var n = renderEnumerable(copy);
                return settings.output(n);
            };
            this.join = function () {
                return this.toArray().join.apply(this.toArray(), arguments);
            };
        }),
        asEnumerable: function (array, config) {
            var _enumerable = null;
            if (pro.isArray(array) || pro.isObject(array) || pro.isReadOnlyArray(array)) {
                _enumerable = new pro.collections.enumerable(array, config);
            } else if (pro.isClass(array) && array.is(pro.collections.enumerable) && array.toArray) {
                _enumerable = new pro.collections.enumerable(array.toArray(), config);
            }
            return _enumerable;
        },
        whileCanEnumerate: function (enumerable, action) {
            if (pro.isClass(enumerable) && enumerable.is(pro.collections.enumerable)) {
                while (enumerable.canEnumerate()) {
                    action.call(this, enumerable.current());
                    enumerable.next();
                }
                enumerable.reset();
            }
            return this;
        }
    }));
    pro.collections.extend(pro.object({
        list: pro.$class('pro.collections.list << pro.collections.enumerable', function (init) {
            var base = [],
              $this = this,
              postInvoke = function () {
                  $this.initializeBase(base);
              };
            if (pro.isEnumerable(init)) {
                base = init.toArray();
            } else if (pro.isArray(init)) {
                base = init;
            } else if (arguments.length > 1) {
                pro.$for(arguments, function (i, arg) {
                    base.push(arg);
                });
            }
            this.overrides = pro.object({
                clear: 'clear'
            });
            this.initializeBase(base);
            this.asEnumerable = function () {
                return pro.collections.asEnumerable(base);
            };
            this.add = function (item) {
                base = this.asEnumerable().add(item).toArray();
                postInvoke();
                return this;
            };
            this.addRange = function (enumerable) {
                base = this.asEnumerable().addRange(enumerable).toArray();
                postInvoke();
                return this;
            };
            this.remove = function (item) {
                base = this.asEnumerable().remove(item).toArray();
                postInvoke();
                return this;
            };
            this.removeRange = function (enumerable) {
                base = this.asEnumerable().removeRange(enumerable).toArray();
                postInvoke();
                return this;
            };
            this.clear = function () {
                base = this.asEnumerable().clear().toArray();
                postInvoke();
                return this;
            };
        }, pro.collections.enumerable),
        dictionary: pro.$class('pro.collections.dictionary << pro.collections.enumerable', function (init) {
            var container = [],
              $this = this,
              postInvoke = function () {
                  $this.initializeBase(container);
              };
            if (pro.isEnumerable(init)) {
                container = init.toArray();
            } else if (pro.isArray(init)) {
                container = init;
            } else if (arguments.length > 1) {
                pro.$for(arguments, function (i, arg) {
                    container.push(arg);
                });
            }
            this.overrides = pro.object({
                clear: 'clear',
                remove: 'remove',
                add: 'add'
            });
            this.initializeBase(container);
            this.add = function (key, value) {
                var keyValuePair;
                if (arguments.length === 1 && pro.isClass(arguments[0]) && arguments[0].is(pro.keyValuePair)) {
                    var properties = pro.getObjectProperties(arguments[0]);
                    keyValuePair = new pro.keyValuePair(arguments[0][properties[0]], arguments[0][properties[1]]);
                } else if (arguments.length === 2) {
                    keyValuePair = new pro.keyValuePair(arguments[0], arguments[1]);
                }
                if (pro.collections.asEnumerable(container).where(function (kvp) {
                    return kvp.key === keyValuePair.key;
                }).count() === 0) {
                    container.push(keyValuePair);
                }
                postInvoke();
                return this;
            };
            this.get = function (key) {
                return this.where(function (kvp) {
                    return kvp.key === key;
                }).first();
            };
            this.containsKey = function (key) {
                return pro.isDefined(this.where(function (kvp) {
                    return kvp.key === key;
                }).first());
            };
            this.remove = function (key) {
                var query = pro.collections.asEnumerable(container).where(function (kvp) {
                    return kvp.key === key;
                }).first();
                if (pro.isDefined(query)) {
                    container = this.asEnumerable().remove(query).toArray();
                }
                postInvoke();
                return this;
            };
            this.clear = function () {
                container = this.asEnumerable().clear().toArray();
                postInvoke();
                return this;
            };
            this.asEnumerable = function () {
                return pro.collections.asEnumerable(container);
            };
        }, pro.collections.enumerable),
        stack: pro.$class('pro.collections.stack << pro.collections.enumerable', function (init) {
            var s = [];
            var $this = this;
            if (pro.isArray(arguments[0])) {
                s = arguments[0];
            } else if (pro.isEnumerable(arguments[0])) {
                s = arguments[0].toArray();
            } else if (arguments.length > 1) {
                pro.$for(arguments, function (i, arg) {
                    s.push(arg);
                });
            }
            var postInvoke = function () {
                $this.initializeBase(s);
            };
            this.overrides = pro.object({
                clear: 'clear'
            });
            this.initializeBase(s);
            this.pop = function () {
                var value = this.toArray().pop() || null;
                this.remove(value);
                postInvoke();
                return value;
            };
            this.clear = function () {
                s = this.asEnumerable().clear().toArray();
                postInvoke();
                return this;
            };
            this.asEnumerable = function () {
                return pro.collections.asEnumerable(s);
            };
            return this;
        }, pro.collections.enumerable),
        queue: pro.$class('pro.collections.queue << pro.collections.enumerable', function (init) {
            var q = [];
            var $this = this;
            if (pro.isArray(arguments[0])) {
                q = arguments[0];
            } else if (pro.isEnumerable(arguments[0])) {
                q = arguments[0].toArray();
            } else if (arguments.length > 1) {
                pro.$for(arguments, function (i, arg) {
                    q.push(arg);
                });
            }
            var postInvoke = function () {
                $this.initializeBase(q);
            };
            this.overrides = pro.object({
                clear: 'clear'
            });
            this.initializeBase(q);
            this.enqueue = function (item) {
                q.push(item);
                postInvoke();
                return this;
            };
            this.cut = function (item) {
                q.unshift(item);
                postInvoke();
                return this;
            };
            this.dequeue = function () {
                var value = q.shift();
                postInvoke();
                return value;
            };
            this.clear = function () {
                q = this.asEnumerable().clear().toArray();
                postInvoke();
                return this;
            };
            this.asEnumerable = function () {
                return pro.collections.asEnumerable(q);
            };
            return this;
        }, pro.collections.enumerable),
        array: {
            scramble: {
                random: function (array) {
                    var output = [];
                    if (pro.isArray(array)) {
                        var len = array.length - 1;
                        var randomGen = function () {
                            return pro.math.random(0, len, true);
                        };
                        pro.collections.asEnumerable(array).forEach(function (i, c) {
                            var n = randomGen();
                            var itemAt = array[n];
                            array[i] = itemAt;
                            array[n] = c;
                        });
                        output = array.slice(0);
                        return output;
                    }
                    return array;
                },
                calculated: function (array, seed) {
                    var output = [];
                    if (pro.isArray(array)) {
                        var len = array.length - 1;
                        var n = pro.isNumber(seed) ? seed : 3;
                        var placeGen = function (i) {
                            return (i + n) > len ? ((len - n) - i) + n : i + n;
                        };
                        pro.collections.asEnumerable(array).forEach(function (i, c) {
                            var n = placeGen(i);
                            var itemAt = array[n];
                            array[i] = itemAt;
                            array[n] = c;
                        });
                        output = array.slice(0);
                        return output;
                    }
                    return array;
                }
            },
            chunk: function (array, chunkSize) {
                return pro.collections.asEnumerable(array).chunk(chunkSize).toArray();
            },
            merge: function (arr1, arr2) {
                if (arr1 && arr2 && pro.isDefined(arr1.length) && pro.isDefined(arr2.length)) {
                    var master = [];
                    if (arr1.slice) {
                        master = arr1.slice(0);
                    } else {
                        for (var i = 0; i < arr1.length; i++) {
                            master[i] = arr1[i];
                        }
                    }
                    for (var i = 0; i < arr2.length; i++) {
                        master.push(arr2[i]);
                    }
                    return master;
                }
                return [];
            }
        }
    }));
    pro.collections.extend(pro.object({
        typedList: pro.$class('pro.collections.list<T> << pro.collections.enumerable', function (T, init) {
            if (pro.isUndefined(T)) {
                throw new Error('Argument "T" is undefined. Please specify the type of the list.');
            } else if (!pro.isFunction(T)) {
                throw new Error('Argument "T" must be a constructor function. Please specify a constructor function to identify the prototype.');
            } else if (pro.isFunction(T) && !pro.isDefined(T.prototype)) {
                throw new Error('Argument "T" must be a constructor function. The function provided is not a constructor function.');
            }
            var isTypeValid = function (obj, type) {
                return pro.isOfType(obj, type);
            };
            var arr = pro.isArray(init) ? init : [];
            var invalidCount = function (coll) {
                return pro.collections.asEnumerable(coll).where(function (item) {
                    return !isTypeValid(item, T);
                }).count();
            };
            var invalid = invalidCount(arr) > 0;
            if (invalid === true) {
                throw new Error('typedList was not intialized with an array containing only type "T" where "T" is ' + (T.prototype.isClass === true ? new T().getType().name : T.toString().replace(/(function)|[\{\}\(\)\[\]]+|native code/gi, '').trim()));
            }
            var $this = this;
            var type = T;
            var list = new pro.collections.list(arr);
            var postInvoke = function () {
                $this.initializeBase(list.toArray());
            };
            this.overrides = {
                add: 'add',
                addRange: 'addRange',
                remove: 'remove',
                removeRange: 'removeRange',
                asEnumerable: 'asEnumerable',
                clear: 'clear'
            };
            this.initializeBase(init);
            this.containedType = T.prototype.isClass === true ? new T().getType() : T.prototype;
            this.asEnumerable = function () {
                return pro.collections.asEnumerable(base);
            };
            this.add = function (item) {
                if (isTypeValid(item, type)) {
                    list.add(item);
                    postInvoke();
                }
                return this;
            };
            this.addRange = function (enumerable) {
                if (invalidCount(enumerable) <= 0) {
                    list.addRange(enumerable);
                    postInvoke();
                }
                return this;
            };
            this.remove = function (item) {
                list.remove(item);
                postInvoke();
                return this;
            };
            this.removeRange = function (enumerable) {
                list.removeRange(enumerable);
                postInvoke();
                return this;
            };
            this.clear = function () {
                list.clear();
                postInvoke();
                return this;
            };
        }, pro.collections.list)
    }));
    return pro.collections;
});
