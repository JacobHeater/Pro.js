/****************************************************************************
 *****************************************************************************
 *****************************************************************************{
Summary: Pro.JS - A comprehensive JavaScript Library for all JavaScript applications.
The library provides a set of functionality that makes enforcing type constraints
and creating typed classes easier. Other helper methods add value, like a string formatter
that can replace shortcuts with actual values, a string builder for easily concatenating strings,
among many other useful features.
Author: Jacob Heater,
Dependencies: None,
Questions/Comments: jacobheater@gmail.com,
License: Open Source under MIT License @ https://github.com/JacobHeater/Pro.js/blob/Version-2.0/LICENSE,
Version: 2.0
}
 *****************************************************************************
 *****************************************************************************
 *****************************************************************************/
(function (global, undefined) {
    "use strict";
    var pro = {
        /*@ Purpose: A hashtable that maps all of the JavaScript types to their string values */
        types: {
            fn: 'function',
            num: 'number',
            bool: 'boolean',
            obj: 'object',
            undef: 'undefined',
            string: 'string'
        },
        /*@ Purpose: Returns the JavaScript typeof value of the given object.
		@ Param: obj -> object: Any object to return the type of.
		@ Returns: String -> The string value of the object's type.*/
        getType: function (obj) {
            return typeof obj;
        },
        /*@ Purpose: Indicates if the given object is of type function.
		@ Param: fn -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is a function or not.*/
        isFunction: function (fn) {
            return pro.getType(fn) === pro.types.fn;
        },
        /*@ Purpose: Indicates if the given object is of type NaN.
		@ Param: nan -> NaN: The value to check against.
		@ Returns: Boolean -> Indicates if the value evaluated to NaN.*/
        isNaN: function (nan) {
            return (pro.getType(nan) === pro.types.num && nan * 0 !== 0);
        },
        /*@ Purpose: Indicates if the given object is of type object.
		@ Param: obj -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is an object or not.*/
        isObject: function (obj) {
            return pro.getType(obj) === pro.types.obj && obj !== null;
        },
        /*@ Purpose: Indicates if the given object is of type number.
		@ Param: n -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is a number or not.*/
        isNumber: function (n) {
            return (pro.getType(n) === pro.types.num && n * 0 === 0);
        },
        /*@ Purpose: Indicates if the given object is of type boolean.
		@ Param: bool -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is a Boolean or not.*/
        isBoolean: function (bool) {
            return pro.getType(bool) === pro.types.bool;
        },
        /*@ Purpose: Indicates if the given object is of type string.
		@ Param: str -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is a string or not.*/
        isString: function (str) {
            return pro.getType(str) === pro.types.string;
        },
        /*@ Purpose: Indicates if the given object is of type undefined.
		@ Param: obj -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is undefined or not.*/
        isUndefined: function (obj) {
            return pro.getType(obj) === pro.types.undef || obj === undefined || obj === null;
        },
        /*@ Purpose: Indicates if the given object is of type T where T can be a constructor for prototype checking or a primitive type.
		@ Param: obj -> object: The object to check the type of against T.
		@ Param: T -> Prototype or primitive: The type to check against.
		@ Returns: Boolean -> Indicates if the object is of type T.*/
        isOfType: function (obj, T) {
            if (pro.isFunction(T)) {
                if (T.prototype.isClass === true && pro.isClass(obj)) {
                    return obj.is(T);
                } else {
                    var isType = false;
                    var proto = Object.getPrototypeOf(obj);
                    while (proto !== null && isType === false) {
                        if (proto === T.prototype) {
                            isType = true;
                        } else {
                            proto = Object.getPrototypeOf(proto);
                        }
                    }
                    return isType;
                }
            } else {
                return pro.getType(obj) === pro.getType(T);
            }
            return false;
        },
        /*@ Purpose: Indicates if the given object is not of type undefined.
		@ Param: obj -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is defined or not.*/
        isDefined: function (obj) {
            return pro.isUndefined(obj) === false;
        },
        /*@ Purpose: Indicates if the given object is null or not.
		@ Param: obj -> object: The object to check the value of.
		@ Returns: Boolean -> Indicates if the object is null or not.*/
        isNull: function (obj) {
            return pro.isUndefined(obj) === true;
        },
        /*@ Purpose: Indicates if the given object is null or not.
		@ Param: obj -> object: The object to check the value of.
		@ Returns: Boolean -> Indicates if the object is null or not.*/
        isNotNull: function (obj) {
            return pro.isNotNull(obj) === false;
        },
        /*@ Purpose: Indicates if the object has a length property indicating that the object can be enumerated.
		@ Param: obj -> object: The object to check.
		@ Returns: Boolean -> Indicates if the object has the length property for enumeration.
		@ Note: The object cannot be a string and cannot be a function.*/
        canEnumerate: function (obj) {
            return pro.isDefined(obj) && pro.isDefined(obj.length) && !pro.isString(obj) && !pro.isFunction(obj);
        },
        /*@ Purpose: Indicates if the given object is an enumerable object, but is not mutable.
		@ Param: obj -> Read-only Array: The read-only array to check.
		@ Returns: Boolean -> Indicates if the given object is a read-only array or not.*/
        isReadOnlyArray: function (obj) {
            return pro.canEnumerate(obj) && !pro.isArray(obj);
        },
        /*@ Purpose: Indicates if the given object is an array or not.
		@ Param: array -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is an array or not. */
        isArray: function (array) {
            return pro.isDefined(array) && pro.isDefined(array.length) && pro.isDefined(array.slice) && pro.isDefined(array.pop) && pro.isDefined(array.push);
        },
        /*@ Purpose: Indicates if the given object is of type pro.collections.enumerable.
		@ Param: enumerable -> object: The object to check the type of.
		@ Returns: Boolean -> Indicates if the object is an instance of pro.collections.enumerable.*/
        isEnumerable: function (enumerable) {
            return pro.isDefined(enumerable) && pro.isDefined(enumerable.count) && pro.isDefined(enumerable.where);
        },
        /*@ Purpose: Indicates if the two objects are equal in both type and, if the two objects are of type object, then maps the properties and attempts to compare the two values.
		@ Param: object1 -> object: The first object to compare against.
		@ Param: object2 -> object: The second object to compare against.
		@ Returns: Boolean -> Indicates if the objects are equal.*/
        areEqual: function (object1, object2) {
            var areEqual = false;
            if (pro.getType(object1) === pro.getType(object2)) {
                if (pro.isObject(object1) && pro.isObject(object2)) {
                    var propsEqual = true;
                    pro.enumerateObject(object1, function (key, value) {
                        var obj2Val = object2[key];
                        if (obj2Val && pro.getType(value) === pro.getType(obj2Val)) {
                            if (!pro.areEqual(value, obj2Val)) {
                                propsEqual = false;
                            }
                        }
                    });
                    areEqual = propsEqual;
                } else {
                    areEqual = object1.toString().trim() === object2.toString().trim();
                }
            }
            return areEqual;
        },
        /*@ Purpose: Encapsulates a multi-functional for loop that serves an a for-each-loop and a for-in-loop.
		@ Overloads:
		1. $for(obj, callback)
		@ Param: obj -> object: An object to enumerate over using a for-in-loop.
		@ Param: callback -> function: A function that will be used to perform an action over each member of the object.
		@ Returns: void.
		2. $for(enumerable, callback)
		@ Param: enumerable -> pro.collections.enumerable: The pro.collections.enumerable instance to enumerate over.
		@ Param: callback -> function: A function that will be used to perform an action over each member of the enumerable.
		@ Returns: void.
		3. $for(n1, n2, callback)
		@ Param: n1 -> number: The base number to use for the loop.
		@ Param: n2 -> number: The target number to use for the loop.
		@ Param: callback -> function: A function that will be used to perform an action over each number of the iteration.
		@ Note: if n1 > n2, then the loop will increment, otherwise it will decrement.
		@ Returns: void.*/
        $for: function () {
            if (pro.isObject(arguments[0])) {
                if ((pro.isArray(arguments[0]) || pro.canEnumerate(arguments[0])) && arguments[0].length > 0) {
                    var array = arguments[0],
					callback = pro.isFunction(arguments[1]) ? arguments[1] : function () { };
                    for (var i = 0, len = array.length; i < len; i++) {
                        //var _break = callback.call(this, i, array[i]);
                        var _break = callback(i, array[i]);
                        if (_break === false) {
                            break;
                        }
                    }
                } else if (pro.isEnumerable(arguments[0])) {
                    var enumerable = arguments[0],
					callback = pro.isFunction(arguments[1]) ? arguments[1] : function () { };
                    for (var i = 0, len = enumerable.count() ; i < len; i++) {
                        //var _break = callback.call(this, i, enumerable.atIndex(i));
                        var _break = callback(i, enumerable.atIndex(i));
                        if (_break === false) {
                            break;
                        }
                    }
                } else {
                    var object = arguments[0],
					callback = pro.isFunction(arguments[1]) ? arguments[1] : function () { };
                    for (var key in object) {
                        //var _break = callback.call(this, key, object[key]);
                        var _break = callback(key, object[key]);
                        if (_break === false) {
                            break;
                        }
                    }
                }
            } else if (pro.isNumber(arguments[0]) && pro.isNumber(arguments[1])) {
                var n1 = arguments[0],
				n2 = arguments[1],
				callback = pro.isFunction(arguments[2]) ? arguments[2] : function () { };
                if (n1 < n2) {
                    for (var i = n1; i < n2; i++) {
                        //var _break = callback.call(this, i);
                        var _break = callback(i);
                        if (_break === false) {
                            break;
                        }
                    }
                } else if (n1 > n2) {
                    for (var i = n1; i > n2; i--) {
                        //var _break = callback.call(this, i);
                        var _break = callback(i);
                        if (_break === false) {
                            break;
                        }
                    }
                }
            }
        },
        /*@ Purpose: Extends and object's properties with properties from a source object.
		@ Param: objA -> object: The target object that will be extended.
		@ Param: objB -> object: The source object that will be copied.
		@ Param: isDeep? -> boolean: Indicates if enumerable members should be shallow copied or deep copied.
		@ Returns: The extended objA object.*/
        extend: function (objA, objB, isDeep, ignores) {
            var extended,
			extender,
			_deep = false,
			_ignore = {},
			args = arguments;
            if (args.length === 1) {
                extended = this;
                extender = args[0];
            } else if (args.length === 2) {
                extended = objA;
                extender = objB;
            } else if (args.length === 3) {
                extended = objA;
                extender = objB;
                if (pro.isObject(args[2])) {
                    _ignore = args[2];
                } else if (pro.isBoolean(args[2])) {
                    _deep = args[2];
                }
            } else if (arguments.length === 4) {
                extended = objA;
                extender = objB;
                _deep = pro.isBoolean(args[2]) ? args[2] : false;
                _ignore = pro.isObject(args[3]) ? args[3] : {};
            }
            if (pro.isObject(extended) && pro.isObject(extender)) {
                pro.enumerateObject(extender, function (key, value) {
                    if (pro.isDefined(extended[key])) {
                        if (pro.isArray(extended[key]) && pro.isArray(extender[key])) {
                            if (_deep === true) {
                                pro.$for(extender[key], function (i, value) {
                                    if (extended[key].indexOf(value) < 0) {
                                        extended[key].push(value);
                                    }
                                });
                            } else {
                                extended[key] = extender[key];
                            }
                        } else if (pro.isObject(extended[key]) && pro.isObject(value)) {
                            pro.extend(extended[key], extender[key], _deep, _ignore);
                        } else {
                            if (pro.isUndefined(_ignore[key])) {
                                extended[key] = extender[key];
                            }
                        }
                    } else {
                        if (pro.isUndefined(_ignore[key])) {
                            extended[key] = value;
                        }
                    }
                });
            }
            return extended;
        },
        /*@ Purpose: Copies the source array to the target array.
		@ Param: source -> Array: The array to be copied to the target.
		@ Param: target -> Array: The target that will be copied to.
		@ Returns: Array -> The copied array.*/
        copyArray: function (source, target) {
            var _source = [],
			_target = [];
            if (pro.isArray(source) && pro.isArray(target)) {
                _source = source;
                _target = target;
            } else if (pro.isEnumerable(source) && pro.isEnumerable(target)) {
                _source = source.toArray();
                _target = target.toArray();
            } else if (pro.isEnumerable(source) && pro.isArray(taret)) {
                _source = source.toArray();
                _target = target;
            } else if (pro.isArray(source) && pro.isEnumerable(target)) {
                _source = source;
                _target = target.toArray();
            }
            return target = _target.concat(_source);
        },
        /*@ Purpose: Enumerates over the given object's properties and pushes them into an array for later enumeration.
		@ Param: obj -> object: The object whose properties will be enumerated.
		@ Returns: Array -> The object's property names in an Array.*/
        getObjectProperties: function (obj) {
            var properties = [];
            if (pro.isObject(obj) || pro.isFunction(obj)) {
                pro.enumerateObject(obj, function (key, value) {
                    properties.push(key);
                });
            }
            return properties;
        },
        /*@ Purpose: Enumerates over the given object's properties and values and compiles them into an array for later enumeration.
		@ Param: obj -> object: The object whose properties and values will be enumerated.
		@ Returns: Array -> The object's properties and values in an Array*/
        getHashTable: function (obj) {
            var hashTable = obj;
            if (pro.isObject(obj) || pro.isFunction(obj)) {
                hashTable = [];
                pro.enumerateObject(obj, function (key, value) {
                    hashTable.push({
                        key: key,
                        value: value
                    });
                });
            }
            return hashTable;
        },
        /*@ Purpose: Enumerates over the given object's properties and pushes them into an array and returns the array length.
		@ Param: obj -> object: The object whoe property count will be returned.
		@ Returns: Number -> The number of properties on the given object instance.*/
        propCount: function (obj) {
            return pro.getObjectProperties(obj).length;
        },
        /*@ Purpose: Enumerates over the object's properties and invokes the given callback over each member.
		@ Param: obj -> object: The object whose members will be enumerated.
		@ Param: action -> function: The action that will be invoked over each object member.
		@ Returns: void.*/
        enumerateObject: function (obj, action) {
            if ((pro.isObject(obj) || pro.isFunction(obj)) && pro.isFunction(action)) {
                for (var prop in obj) {
                    try {
                        action(prop, obj[prop]);
                    } catch (ex) { }
                }
            }
        },
        /*@ Purpose: Looks over the array for any undefined members and stops enumeration if a member is undefined. If no undefined member is found, then validation returns true.
		@ Param: args -> Arguments List: The arguments to check for undefined members from.
		@ Returns: Boolean -> Indicates if the members are all defined.
		@ Example: pro.areDefined(true, false, {}, undefined, []);*/
        areDefined: function (args) {
            var allDefined = true;
            pro.$for(arguments, function (i, arg) {
                if (pro.isUndefined(arg)) {
                    allDefined = false;
                }
                return allDefined;
            });
            return allDefined;
        }
    };
    pro.extend({
        plainObject: function () { },
        object: function (init) {
            var instance = new pro.plainObject();
            pro.extend(instance, init || {});
            return instance;
        },
        /*@ Purpose: A class that serves as the type of all of the decorated $class function instances.
		@ Param: typeName -> string: The name of the type.
		@ Param: nativeType -> string: The native JavaScript type of the object. Should be retrieved using the typeof keyword.
		@ Returns: Object -> The initialized instance of the pro.type class.*/
        type: function (typeName, nativeType) {
            this.name = typeName || pro.emptyString;
            this.nativeType = nativeType || null;
            return this;
        },
        /*@ Purpose: Identifies if the given object is an instance of a decorated $class function.
		@ Param: obj -> Object: An instance of a reference type.
		@ Returns: Boolean -> Indicates if the object is an instance of a decorated $class function.*/
        isClass: function (obj) {
            var value = false;
            if (pro.isFunction(obj)) {
                value = pro.isDefined(obj.prototype.isClass) && obj.prototype.isClass === true;
            } else if (pro.isObject(obj)) {
                value = pro.isDefined(obj.isClass) && obj.isClass === true;
            }
            return value;
        },
        /*@ Purpose: A helper function that allows the .apply() method to be invoked on a constructor function.
        @ Param: constructor: -> function: The constructor function to invoke the .apply() method on.
        @ Param: args: -> Array: The arguments array to pass into the constructor.
        @ Returns: Object -> The intialized prototype instance. */
        applyConstructor: function (constructor, args) {
            if (pro.isArray(args) && pro.isFunction(constructor)) {
                var ctor = function () {
                    return constructor.apply(this, args);
                };
                ctor.prototype = constructor.prototype;
                return new ctor();
            }
            return undefined;
        },
        /*@ Purpose: Encapsulates prototypical inheritance into a decorator function that adds many type checking features.
		@ Param: type -> string: The name of the class or type.
		@ Param: constructor -> function: Serves as the constructor when the new keyword is used.
		@ Param: base ->  function: Serves as the base of the constructor that will identify the constructor's prototype.
		@ Returns: Function -> The decorated constructor function.*/
        $class: function (type, constructor, base) {
            var $this = pro;
            if (pro.isString(type) && pro.isFunction(constructor)) {
                constructor.type = type;
                constructor.$class = true;
                if (pro.isFunction(base)) {
                    constructor.prototype.base = null;

                    function construct(constructor, args) {
                        var base = function () {
                            return constructor.apply(this, args);
                        };
                        base.prototype = constructor.prototype;
                        return new base();
                    }
                    constructor.prototype.initializeBase = function (params) {
                        var $this = this;
                        $this.base = construct(base, arguments);
                        pro.enumerateObject($this.base, function (key, value) {
                            if (key !== "getType" && key !== "isClass" && key !== "is" && key !== "base" && key !== "initializeBase" && key !== 'getHashCode' && key !== 'overrides') {
                                if (pro.isDefined($this.overrides)) {
                                    if (!pro.isDefined($this.overrides[key])) {
                                        $this[key] = value;
                                    }
                                } else {
                                    $this[key] = value;
                                }
                            }
                        });
                        $this.toString = $this.base.toString || $this.toString;
                        $this.valueOf = $this.base.valueOf || $this.valueOf;
                        $this.toLocaleString = $this.base.toLocaleString || $this.toLocaleString;
                    };
                }
                constructor.static = function (members) {
                    if (pro.isObject(members)) {
                        pro.enumerateObject(members, function (key, value) {
                            constructor[key] = value;
                        });
                    }
                    return constructor;
                };
                constructor.extend = function (obj) {
                    var extender = obj;
                    if (!pro.isClass(obj)) {
                        extender = pro.object(extender);
                    }
                    pro.extend(constructor.prototype, extender);
                    return constructor;
                };
                constructor.prototype.extend = function (obj) {
                    return pro.extend(this, obj);
                };
                constructor.prototype.getType = function () {
                    var _type = new pro.type(type, pro.getType(this));
                    _type.isClass = true;
                    _type.constructor = constructor;
                    if (pro.isDefined(this.base)) {
                        if (pro.isClass(this.base)) {
                            _type.baseType = this.base.getType();
                            _type.baseType.isClass = true;
                            _type.baseType.constructor = this.base.constructor;
                        } else {
                            _type.baseType = typeof this.base.constructor.prototype;
                            _type.baseType.isClass = false;
                            _type.baseType.constructor = this.base.constructor;
                        }
                    }
                    return _type;
                };
                constructor.runtime = {
                    attributes: pro.object()
                };
                constructor.attributes = function (attrs) {
                    if (arguments.length > 1) {
                        pro.$for(arguments, function (i, o) {
                            if (pro.isFunction(o)) {
                                new o();
                            } else if (pro.isClass(o) && o.is(pro.construct)) {
                                var ctor = o.ctor;
                                var args = o.params;
                                if (!pro.isArray(args)) {
                                    args = [args];
                                }
                                var obj = construct(ctor, args);
                                new constructor.call
                            }
                        });
                    } else if (arguments.length === 1 && pro.isObject(attrs)) {
                        if (!construct) {
                            var construct = function (constructor, args) {
                                var base = function () {
                                    return constructor.apply(this, args);
                                };
                                base.prototype = constructor.prototype;
                                return new base();
                            };
                        }
                        pro.enumerateObject(attrs, function (key, value) {
                            var o = value;
                            if (pro.isFunction(o)) {
                                new o();
                            } else if (pro.isClass(o) && o.is(pro.construct)) {
                                var ctor = o.ctor;
                                var args = o.params;
                                if (!pro.isArray(args)) {
                                    args = [args];
                                }
                                var obj = construct(ctor, args);
                            }
                        });
                    }
                    return this;
                };
                constructor.prototype.getHashCode = function () {
                    var hashCode = 0,
					json = this.getType().name + pro.toJson(this),
					charArray = json.split(''),
					encoded = [];
                    for (var i = 0; i < charArray.length; i++) {
                        var char = charArray[i];
                        var charCode = char.charCodeAt(0);
                        encoded[i] = charCode;
                    }
                    hashCode = parseInt(encoded.join(''), 6);
                    return hashCode;
                };
                constructor.prototype.isClass = true;
                constructor.prototype.asJson = function () {
                    return pro.toJson(this);
                };
                constructor.prototype.is = function (typeName) {
                    var name = this.getType().name,
					_typeName = pro.isClass(typeName) ? typeName.prototype.getType().name : typeName,
					$this = this,
					inheritance = name.split('<<'),
					isTypeMatch = false;
                    if (_typeName === name) {
                        isTypeMatch = true;
                    } else if (inheritance.length > 0 && this.base && this.base.isClass === true && pro.isClass(_typeName)) {
                        pro.$for(inheritance, function (i, value) {
                            if (_typeName.trim() === value.trim()) {
                                isTypeMatch = true;
                                return false;
                            }
                        });
                    }
                    if (isTypeMatch === false) {
                        var checkBase = function (obj) {
                            var isMatch = false;
                            if (pro.isDefined(obj.base)) {
                                var base = obj.base,
								_proto = pro.isFunction(_typeName) ? _typeName.prototype : pro.isObject(_typeName) && pro.areDefined(_typeName.constructor, _typeName.constructor.prototype) ? _typeName.constructor.prototype : _typeName,
								baseProto = pro.isObject(base) && pro.areDefined(base.constructor, base.constructor.prototype) ? base.constructor.prototype : pro.isFunction(base) ? base.prototype : base;
                                if (pro.areDefined(base.isClass, base.getType)) {
                                    if (pro.isString(_proto)) {
                                        isMatch = _proto === base.getType().name;
                                    } else {
                                        isMatch = _proto === baseProto;
                                    }
                                } else {
                                    isMatch = _proto === baseProto;
                                }
                                if (!isMatch) {
                                    checkBase(obj.base);
                                } else {
                                    isTypeMatch = isMatch;
                                }
                            }
                            return isMatch;
                        };
                        checkBase($this);
                    }
                    return isTypeMatch;
                };
                constructor.prototype.overrides = {};
                return constructor;
            }
            return function () { };
        }
    });
    /***********************************************************
	 ***********************************************************
	Module definition for extending the pro core library
	with other modules/namespaces using a private module class.
	Modules can also be extended by modules. This keeps the
	means of extending objects uniform and consistent.
	 ***********************************************************
	 ***********************************************************/
    var Module = function (name, module) {
        Module.validate(name, module);
        this.name = name;
        this.implementation = module;
        this.implementation.module = function (name, module) {
            var _module = new Module(name, module);
            this[_module.name] = _module.implementation;
            return this[_module.name];
        };
        this.implementation.extend = function (obj) {
            return pro.extend(this, obj);
        };
    };
    Module.invalidModuleException = pro.$class('pro.module.invalidModuleException << pro.exception', function () {
        this.initializeBase('This provided module name or implementation are invalid. Argument name must be of type string. Argument module must be of type object.');
    }, pro.exception);
    Module.validate = function (name, module) {
        if (!pro.isString(name) || !pro.isObject(module)) {
            throw new Module.invalidModuleException();
        }
    };
    pro.extend({
        module: function (name, module) {
            Module.validate(name, module);
            var _module = new Module(name, module);
            pro[_module.name] = _module.implementation;
            return pro[_module.name];
        }
    });
    pro.extend({
        factory: function (definition) {
            if (pro.isFunction(definition) && definition.$class === true && pro.isString(definition.type)) {
                function construct(constructor, args) {
                    var factory = function () {
                        return constructor.apply(this, args);
                    };
                    factory.prototype = constructor.prototype;
                    return new factory();
                }
                return function () {
                    return construct(definition, arguments);
                };
            }
            return function () { };
        }
    });
    //End Module defintion.
    pro.extend({
        /*@ Purpose: Serves as a single reference of an empty string value.
		@ Returns: String -> An empty string, or "".
		@ Note: This value should not be changed. (Read only)*/
        emptyString: "",
        /*@ Purpose: Encapsulates the setTimeout function for asynchronous delayed actions.
		@ Param: delay -> number: The amount of time in milliseconds that the timeout should wait before invoking the given function.
		@ Param: action -> function: The function to invoke once the amount of time has ellapsed.
		@ Returns: Object -> The current instance of the pro object. Chainable.*/
        doTimeout: function (delay, action) {
            if (pro.isNumber(delay) && pro.isFunction(action)) {
                setTimeout(function () {
                    action();
                }, delay);
            }
            return this;
        },
        /*@ Purpose: Executes the given action asynchronously using the deferredAction method on a zero-second delay.
		@ Param: action -> function: The method that is to be executed asynchronously.
		@ Returns: Object -> pro.promise for handling callbacks when the method execution is complete.*/
        asyncAction: function (action) {
            return pro.deferredAction(0, action);
        },
        /*@ Purpose: Executes the given action after the timespan has ellapsed and executes the callback in the promise configuration.
		@ Param: delay -> number: The number of milliseconds to delay the action.
		@ Param: action -> function: The method to execute after the delay has ellapsed.
		@ Returns: Object -> pro.promise for handling callbacks when the method execution is complete.*/
        deferredAction: function (delay, action) {
            var promise = new pro.promise();
            pro.doTimeout(delay, function () {
                var retVal = action();
                promise.beginCallstackInvocation(retVal);
            });
            return promise.configurations.standard;
        },
        /*@ Purpose: Clears an interval from the task queue so tha the asynchronous function will no longer execute.
		@ Param: interval -> number: The number that the runtime has assigned the current interval as an identifier.
		@ Returns: Object -> The current instance of the pro object. Chainable.*/
        stopInterval: function (interval) {
            if (pro.isNotNull(interval) && pro.isFunction(global.clearInterval)) {
                global.clearInterval(interval);
            }
            return this;
        },
        /*@ Purpose: Sets an action to be invoked on a set time interval an begins executing immediately.
		@ Param: interval -> number: The timespan in milliseconds to repeatedly invoke the action on.
		@ Param: action -> function: The method to be invoked when the timespan has ellapsed.
		@ Arguments:
		1. $this -> Object: The caller object.
		2. anonymous function -> function: a function that will clear the timer when invoked.
		@ Returns: Number -> The timer ID that the runtime assigned to the timer.*/
        intervalAction: function (interval, action) {
            if (pro.isDefined(global.setInterval) && pro.isFunction(action)) {
                var $this = pro,
				timerId = global.setInterval(function () {
				    action.call($this, function () {
				        global.clearInterval(timerId);
				    })
				}, interval);
                return timerId;
            }
        },
        /*@ Purpose: A $class constructor that represents a name value pair object.
		@ Param: key ->  Any type: A unique key to identify the value by.
		@ Param: value -> Any type: A value that is represented by its corresponding key.
		@ Returns: Object -> The initialized instance of the keyValuePair class.*/
        keyValuePair: pro.$class('pro.keyValuePair', function (key, value) {
            this.key = pro.isDefined(key) ? key : pro.emptyString;
            this.value = pro.isDefined(value) ? value : null;
            return this;
        }),
        /*@ Purpose: Allows for easy formatting of the strings in JavaScript by giving string placeholders to pass in values to.
		@ Param: format -> string: The format with placeholders that represent the values to be replaced.
		@ Param: args [arguments array] -> arguments array: The n-number of arguments that represent the values to replace the placehlders with.
		@ Returns: String -> The formatted string where the placeholders have been replaced by the argument values.
		@ Example:
		1. stringFormatter('The {0} will be replaced {1} the parameter {2}.', 'placeholders', 'by', 'values');
		2. stringFormatter('Hello, {firstName} {lastName}!', { firstName: 'John', lastName: 'Doe' });*/
        stringFormatter: function (format, args) {
            var result = format,
			_args = arguments;
            if (arguments.length > 2 || typeof args !== typeof {}) {
                if (pro.isString(format)) {
                    pro.$for(_args, function (i) {
                        result = result.replace(new RegExp("\\{" + i + "\\}", "gi"), pro.isDefined(_args[i + 1]) ? (_args[i + 1]).toString() : pro.emptyString);
                    });
                }
            } else if (arguments.length === 2) {
                //This is a format that takes an object parameter.
                if (pro.isString(format)) {
                    pro.enumerateObject(args, function (key, value) {
                        var value = typeof args[key] === 'function' ? args[key]().toString() : args[key].toString();
                        result = result.replace(new RegExp("\\{" + key + "\\}", "g"), value);
                    });
                }
            }
            return result;
        },
        /*@ Purpose: A $class constructor that represents a class for easy string concatenation and removal.
		@ Param: init -> string: The string to initialize the builder with.
		@ Returns: Object -> The initialzed pro.stringBuilder class.*/
        stringBuilder: pro.$class('pro.stringBuilder', function (init) {
            var $this = pro,
			cache = pro.isString(init) ? [init] : pro.isDefined(init) ? [init.toString()] : [],
			doActionOnItem = function (string, action) {
			    if (pro.isString(action) && pro.isDefined(string)) {
			        var _string = pro.emptyString;
			        if (pro.isString(string)) {
			            _string = string;
			        } else {
			            _string = string.toString();
			        }
			        if (_string !== pro.emptyString) {
			            cache[action](_string);
			            lastItem = _string;
			        }
			    }
			},
			lastItem = null;
            this.append = function (string) {
                doActionOnItem(string, 'push');
                return this;
            };
            this.prepend = function (string) {
                doActionOnItem(string, 'unshift');
                return this;
            };
            this.clear = function () {
                cache.length = 0;
                lastItem = null;
                return this;
            };
            this.toString = function () {
                return cache.join('');
            };
            this.removeFirst = function () {
                cache.splice(0, 1);
                return this;
            };
            this.removeLast = function () {
                if (cache.length > 0) {
                    cache.splice(cache.length - 1, 1);
                }
                return this;
            };
            this.forEach = function (action) {
                if (pro.isFunction(action)) {
                    pro.$for(cache, function (i, o) {
                        action.call(this, o);
                    });
                }
            };
        }),
        /*@ Purpose: Contains an API for creating GUIDs in JavaScript.
		@ Namespace: pro.GUID*/
        GUID: pro.object({
            /*@ Purpose: A factory function for generating new GUIDs.
			@ Returns: String -> The generated GUID.*/
            create: function () {
                var d = new Date().getTime(),
				uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				    var r = (d + Math.random() * 16) % 16 | 0;
				    d = Math.floor(d / 16);
				    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
				});
                return uuid;
            },
            /*@ Purpose: Checks to see if a string is a GUID or not.
			@ Param: string -> string: The string to check.
			@ Returns: Boolean -> Indicates if the string is a GUID or not.*/
            isGuid: function (string) {
                if (pro.isString(string)) {
                    var split = string.split('-'),
					isGuid = true;
                    if (split.length === 5) {
                        var checkSplitLength = function (index, length) {
                            return split[index].length === length;
                        };
                        if ((checkSplitLength(0, 8) && checkSplitLength(1, 4) && checkSplitLength(2, 4) && checkSplitLength(3, 4) && checkSplitLength(4, 12)) === false) {
                            isGuid = false;
                        }
                    } else {
                        isGuid = false;
                    }
                    return isGuid;
                }
                return false;
            },
            /*@ Purpose: The default zeroed value of a GUID.*/
            $default: '00000000-0000-0000-0000-000000000000'
        }),
        /*@ Purpose: Internally uses the JSON2.js library functions to serialize an object into JSON if the library has been imported.
		@ Param: object -> object: The object to serialize into JSON.
		@ Param: replacer? -> function: The replacer method that handles replacing values in the JSON string.
		@ Param: replace? -> unknown: See JSON documentation.*/
        toJson: function (object, replacer, replace) {
            var json = object;
            var args = arguments;
            pro.tryCatch(function () {
                if (pro.areDefined(JSON, JSON.stringify)) {
                    json = JSON.stringify.apply(this, args);
                }
            }, function (ex) {
                //Suppress JSON related errors.
            });
            return json;
        },
        /*@ Purpose: Internal uses the JSON2.js library functions to deserialize an object if the library has been imported.
		@ Param: jsonString -> string: The JSON string to deserialize into an object.
		@ Param: reviver -> function: The custom reviver to use to conver the string back into an object.
		@ Returns: Object -> The object value of the JSON string.*/
        parseJson: function (jsonString, reviver) {
            var output = jsonString;
            pro.tryCatch(function () {
                if (JSON && JSON.parse) {
                    if (reviver) {
                        output = JSON.parse(jsonString, reviver);
                    } else {
                        output = JSON.parse(jsonString);
                    }
                }
            }, function (ex) {
                //Suppress JSON related errors.
            });
            return output;
        },
        convert: pro.object({
            toFloat: function (value) {
                if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
                    return Number(value);
                }
                return NaN;
            },
            toNumber: function (value) {
                if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
                    return Number(value);
                }
                return NaN;
            },
            toString: function (value) {
                return pro.stringFormatter("{0}", value);
            },
            toBoolean: function (value) {
                var outValue = false;
                if (pro.isString(value)) {
                    var trim = value.trim();
                    if (value === 'true') {
                        outValue = true;
                    } else if (value === 'false') {
                        outValue = false;
                    }
                } else {
                    outValue = new Boolean(value).valueOf();
                }
                return outValue;
            },
            toObject: function (value) {
                return new Object(value).valueOf();
            }
        }),
        keyCodeMap: pro.object({
            Backspace: 8,
            Space: 32,
            Tab: 9,
            Enter: 13,
            Shift: 16,
            Ctrl: 17,
            Alt: 18,
            PauseBreak: 19,
            CapsLock: 20,
            Esc: 27,
            PgUp: 33,
            PgDn: 34,
            End: 35,
            Home: 36,
            LeftArrow: 37,
            UpArrow: 38,
            RightArrow: 39,
            DownArrow: 40,
            Insert: 45,
            Delete: 46,
            zero: 48,
            one: 49,
            two: 50,
            three: 51,
            four: 52,
            five: 53,
            six: 54,
            seven: 55,
            eight: 56,
            nine: 57,
            a: 65,
            b: 66,
            c: 67,
            d: 68,
            e: 69,
            f: 70,
            g: 71,
            h: 72,
            i: 73,
            j: 74,
            k: 75,
            l: 76,
            m: 77,
            n: 78,
            o: 79,
            p: 80,
            q: 81,
            r: 82,
            s: 83,
            t: 84,
            u: 85,
            v: 86,
            w: 87,
            x: 88,
            y: 89,
            z: 90,
            LeftWindowsKey: 91,
            RightWindowsKey: 92,
            SelectKey: 93,
            NumLock0: 96,
            NumLock1: 97,
            NumLock2: 98,
            NumLock3: 99,
            NumLock4: 100,
            NumLock5: 101,
            NumLock6: 102,
            NumLock7: 103,
            NumLock8: 104,
            NumLock9: 105,
            Multiply: 106,
            Add: 107,
            Subtract: 109,
            DecimalPoint: 110,
            Divide: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            NumLock: 144,
            ScrollLock: 145,
            SemiColon: 186,
            EqualSign: 187,
            Comma: 188,
            Dash: 189,
            Period: 190,
            FowardSlash: 191,
            GraveAccent: 192,
            OpenBracket: 219,
            BackSlash: 220,
            CloseBracket: 221,
            SingleQuote: 222,
            fromKeyCode: function (keyCode) {
                var value = null;
                if (pro.isNumber(keyCode)) {
                    pro.enumerateObject(this, function (k, v) {
                        if (v === keyCode) {
                            value = k;
                            return false;
                        }
                    });
                }
                return value;
            }
        }),
        /*@ Purpose: A namespace that contains an API with math related functions.
		@ Namespace: pro.math*/
        math: pro.object({
            /*@ Purpose: Generates a random number between the minimum value and the maximum value.
			@ Param: min -> number: The minimum value to generate the number from.
			@ Param: max -> number: The maximum value to generate the number to.
			@ Param: round -> boolean: Indicates if the number should be rounded or returned in decimal form.
			@ Returns: Number -> The randomly generated number.*/
            random: function (min, max, round) {
                var _min = pro.isNumber(min) ? min : 0,
				_max = pro.isNumber(max) ? max : 0,
				_round = pro.isBoolean(round) ? round : false,
				_random = 0;
                if (_max !== _min) {
                    if (_round === true) {
                        _random = Math.floor(Math.random() * (_max - _min)) + _min;
                    } else {
                        _random = Math.random() * (_max - _min) + _min;
                    }
                } else {
                    _random = Math.random();
                }
                return _random;
            }
        }),
        exception: pro.$class('pro.exception << Error', function (message, nativeError) {
            this.initializeBase(message);
            this.error = nativeError;
            this.message = message;
            this.toString = function () {
                return this.base.message;
            };
        }, Error),
        /*@ Purpose: A try catch helper method that utilizes global error handling to handle generic application exceptions.
		@ Param: action -> function: The action to be wrapped in the try block.
		@ Param: onError -> function: The local error handler for this catch block error event.
		@ Returns: void.*/
        tryCatch: function (action, onError) {
            if (pro.isFunction(action)) {
                try {
                    action.call(this);
                } catch (error) {
                    var exception = new pro.exception(error.message, error);
                    if (pro.isFunction(onError)) {
                        onError.call(this, exception);
                    }
                    if (pro.isFunction(pro.tryCatch.errorHandler)) {
                        pro.tryCatch.errorHandler.call(this, exception);
                    }
                }
            }
        },
        /*@ Purpose: Flattens an array if the array contains nested arrays, or the array is a multi-dimensional array.
		@ Param: array -> Array: The array to flatten.
		@ Returns: Array -> The flattened array.*/
        flattenArray: function (array) {
            var _array = pro.isEnumerable(array) ? array.toArray() : array;
            if (pro.isArray(_array) || pro.canEnumerate(_array)) {
                var flattened = [],
				flattener = function (a) {
				    pro.$for(a, function (i, value) {
				        if (pro.isArray(value) || pro.canEnumerate(value)) {
				            flattener(value);
				        } else {
				            flattened.push(value);
				        }
				    });
				};
                flattener(_array);
                return flattened;
            }
            return [];
        },
        /*@ Purpose: A namespace that contains an API for string related functions.
		@ Namespace: pro.string*/
        string: pro.object({
            /*@ Purpose: Converts a string into a title case string - i.e. The first letter of each word is capitalized.
			@ Param: string -> string: The string to be converted to title case.
			@ Returns: String -> The string converted to title case. */
            toTitleCase: function (string) {
                /* Credits:
				This code snippet was taken from David Gouch on GitHub
				https://github.com/gouch/to-title-case */
                if (pro.isString(string)) {
                    var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
                    return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function (match, index, title) {
                        if (index > 0 && index + match.length !== title.length && match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') && title.charAt(index - 1).search(/[^\s-]/) < 0) {
                            return match.toLowerCase();
                        }
                        if (match.substr(1).search(/[A-Z]|\../) > -1) {
                            return match;
                        }
                        return match.charAt(0).toUpperCase() + match.substr(1);
                    });
                }
                return string;
            },
            /*@ Purpose: Indicates if the string is an empty or whitespace value.
			@ Param: string -> string: The string to check.
			@ Retuns: Boolean -> Indicates if the string is empty or whitespace.*/
            isEmpty: function (string) {
                if (!pro.isString(string)) {
                    return true;
                }
                return string.trim() === pro.emptyString;
            },
            /*@ Purpose: Indicates if the string contains a specific value.
			@ Param: sourceString -> string: The source string to lookup the value in.
			@ Param: value -> string: The value to search for in the string.
			@ Returns: Boolean -> Indicates if the value could be found in the source string.*/
            contains: function (sourceString, value) {
                var contains = false;
                if (pro.isString(sourceString) && pro.isString(value)) {
                    contains = sourceString.indexOf(value) > -1;
                }
                return contains;
            },
            /*@ Purpose: Inserts the given string at the desired location and returns the newly constructed string.
			@ Param: string -> string: The string that is to be manipulated.
			@ Param: position -> number: The position in the string to insert the new value at.
			@ Param: value -> string: The value to insert into the original string.
			@ Returns: String -> The newly constructed string.*/
            insert: function (string, position, value) {
                var str = string;
                if (pro.isString(str) && pro.isNumber(position) && pro.isString(value)) {
                    str = [str.slice(0, position), value, str.slice(position)].join('');
                }
                return str;
            },
            /*@ Purpose: Calculates the character code for the character at the given index in the string. This method is fully backwards compatible with legacy browsers.
			@ Param: string -> string: The string to lookup the character code in.
			@ Param: index -> number: The index in the string of the character to get the character code of.
			@ Returns: Number -> The matching character code of the character in the string literal.*/
            charCodeAt: function (string, index) {
                /*Credits:
				This code snippet was taken from the Mozilla Develop Network (MDN).
				https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
				For more information visit the link above.*/
                var str = string;
                var idx = index;
                str += '';
                var code,
				end = str.length;
                var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
                while ((surrogatePairs.exec(str)) != null) {
                    var li = surrogatePairs.lastIndex;
                    if (li - 2 < idx) {
                        idx++;
                    } else {
                        break;
                    }
                }
                if (idx >= end || idx < 0) {
                    return NaN;
                }
                code = str.charCodeAt(idx);
                var hi,
				low;
                if (0xD800 <= code && code <= 0xDBFF) {
                    hi = code;
                    low = str.charCodeAt(idx + 1);
                    // Go one further, since one of the "characters" is part of a surrogate pair
                    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
                }
                return code;
            },
            scramble: pro.object({
                random: function (str) {
                    var output = "";
                    if (pro.isString(str)) {
                        var chars = str.split('');
                        var len = str.length - 1;
                        var randomGen = function () {
                            return pro.math.random(0, len, true);
                        };
                        pro.$for(chars, function (i, c) {
                            var n = randomGen();
                            var charAt = chars[n];
                            chars[i] = charAt;
                            chars[n] = c;
                        });
                        output = chars.join('');
                        return output;
                    }
                    return str;
                },
                calculated: function (str, index) {
                    var output = "";
                    if (pro.isString(str)) {
                        var chars = str.split('');
                        var len = str.length - 1;
                        var n = pro.isNumber(index) ? index : 3;
                        var placeGen = function (i) {
                            return (i + n) > len ? i - n : i + n;
                        };
                        pro.$for(chars, function (i, c) {
                            var n = placeGen(i);
                            var charAt = chars[n];
                            chars[i] = charAt;
                            chars[n] = c;
                        });
                        output = chars.join('');
                        return output;
                    }
                    return str;
                }
            }),
            random: function (length, noEmpty, asyncComplete) {
                var str = "";
                var _length = pro.isNumber(length) ? length : 0;
                var randomize = function (len, empties, async) {
                    if (pro.isNumber(len)) {
                        if (pro.isFunction(async)) {
                            pro.asyncAction(function () {
                                return pro.string.random(len, empties, null);
                            }).complete(function (str) {
                                async(str);
                            }).error(function (err) {
                                async(err);
                            });
                        } else {
                            do {
                                var random = pro.math.random(0, 255, true);
                                var char = String.fromCharCode(random);
                                if (empties === false && char !== pro.emptyString) {
                                    str += char;
                                } else {
                                    str += char;
                                }
                                str = str.replace(/["']/gmi, "");
                            } while (str.length < _length)
                        }
                    }
                };
                if (arguments.length <= 2) {
                    var _async = pro.isFunction(arguments[1]) ? arguments[1] : null
                    var _empties = pro.isBoolean(arguments[1]) ? arguments[1] : true;
                    randomize(_length, _empties, _async);
                } else if (arguments.length === 3) {
                    var _empties = pro.isBoolean(noEmpty) ? noEmpty : true;
                    var _async = pro.isFunction(asyncComplete) ? asyncComplete : null
                    randomize(_length, _empties, _async);
                }
                return str;
            }
        }),
        /*@ Purpose: A namspace that contains a logging API for logging to the console.
		@ Namespace: pro.logging*/
        logging: pro.object({
            log: function (params) {
                if (console && console.log) {
                    if (pro.isFunction(console.log)) {
                        console.log.apply(console, arguments);
                    } else {
                        pro.$for(arguments, function (i, arg) {
                            console.log(arg);
                        });
                    }
                }
                return this;
            },
            error: function (params) {
                if (console && console.error) {
                    if (pro.isFunction(console.error)) {
                        console.error.apply(console, arguments);
                    } else {
                        pro.$for(arguments, function (i, arg) {
                            console.error(arg);
                        });
                    }
                }
                return this;
            }
        }),
        action: pro.$class('pro.action', function () {
            var $action = this;
            this.arguments = [];
            this.method = function () { };
            this.async = false;
            this.delay = 0;
            this.promise = new pro.promise().configurations.standard;
            this.invoke = function (args) {
                var argsArray = [];
                pro.$for(pro.flattenArray(arguments), function (i, arg) {
                    argsArray.push(arg);
                });
                this.arguments = this.arguments.concat(argsArray);
                if (pro.isFunction(this.method) && pro.isArray(this.arguments) && pro.isNumber(this.delay)) {
                    if (this.async === true) {
                        pro.doTimeout(this.delay, function () {
                            $action.method.apply(pro, $action.arguments);
                            $action.promise.beginCallstackInvocation($action.arguments);
                        });
                    } else {
                        this.method.apply(pro, this.arguments);
                    }
                }
                return this;
            };
        }),
        promise: pro.$class('pro.promise', function () {
            var callstack = new pro.collections.list();
            var errorHandler = function (e) { };
            var deferredAction = function () { };
            var deferredLength = 0;
            var isFinal = false;
            var $promise = this;
            this.finalized = false;
            this.deferAction = function (action, length) {
                deferredAction = pro.isFunction(action) ? action : deferredAction;
                deferredLength = pro.isNumber(length) ? length : deferredLength;
                return this;
            };
            this.pushToCallstack = function (action) {
                if (pro.isFunction(action) && !isFinal) {
                    callstack.add(function (params) {
                        var _args = arguments;
                        pro.doTimeout(0, function () {
                            pro.tryCatch(function () {
                                action.apply(pro, _args)
                            }, function (error) {
                                errorHandler.apply(pro, _args);
                            });
                        });
                    });
                }
                return this;
            };
            this.beginCallstackInvocation = function (params) {
                var _arguments = arguments;
                pro.tryCatch(function () {
                    pro.doTimeout(deferredLength, function () {
                        deferredAction.apply(this, _arguments);
                    });
                }, function (ex) {
                    var _innerArgs = [ex];
                    pro.$for(_arguments, function (i, arg) {
                        _innerArgs.push(arg);
                    });
                    errorHandler.apply(pro, _innerArgs);
                });
                callstack.forEach(function (i, action) {
                    action.apply(this, _arguments);
                });
                return this;
            };
            this.setErrorHandler = function (handler) {
                if (pro.isFunction(handler)) {
                    errorHandler = handler;
                }
                return this;
            };
            this.finalize = function () {
                isFinal = true;
                this.finalized = true;
                return this;
            };
            this.configurations = pro.object({
                standard: {
                    complete: function (action) {
                        $promise.pushToCallstack(action).finalize();
                        return this;
                    },
                    error: function (handler) {
                        $promise.setErrorHandler(handler);
                        return this;
                    }
                },
                procedural: {
                    then: function (action) {
                        $promise.pushToCallstack(action);
                        return this;
                    },
                    complete: function (action) {
                        $promise.pushToCallstack(action).finalize();
                        return this;
                    },
                    error: function (handler) {
                        $promise.setErrorHandler(handler);
                        return this;
                    }
                },
                success: {
                    success: function (action) {
                        $promise.pushToCallstack(action);
                        return this;
                    },
                    failure: function (handler) {
                        $promise.setErrorHandler(handler);
                        return this;
                    },
                    complete: function (action) {
                        $promise.pushToCallstack(action).finalize();
                        return this;
                    }
                }
            });
        }),
        /*@ Purpose: An $class interface that defines one member, the Dispose method, that will handle cleanup on any class that implements it.
		@ No parameters are expected, but the Dispose method must be overridden to allow for custom handling of disposal in the method.
		@ Returns: The initialized intance of the pro.disposable class */
        disposable: pro.$class('pro.disposable', function () {
            this.Dispose = function () {
                //Override this function to implement
            };
        }),
        attribute: pro.$class('pro.attribute', function (name, id) {
            this.Name = name;
            this.ID = id;
        }),
        enumeration: function (members) {
            function enumeration() {
                this.parse = function (value) { };
            }
            var enumObject = new enumeration();
            if (pro.isObject(members)) {
                pro.enumerateObject(members, function (key, value) {
                    if (pro.isClass(value) && value.is(pro.enumMember)) {
                        enumObject[key] = value;
                    }
                });
            }
            return enumObject;
        },
        enumMember: pro.$class('pro.enumMember', function (name, value) {
            if (pro.isString(name) && pro.isNumber(value)) {
                this.name = name;
                this.value = value;
                this.toString = function () {
                    return this.name;
                };
                this.valueOf = function () {
                    return this.value;
                };
            } else {
                throw new pro.exception('Enum members can only be a key of type string and a value of type number!', null);
            }
        }).static({
            create: function (name, value) {
                return new pro.enumMember(name, value);
            }
        })
    });
    pro.extend({
        construct: pro.$class('pro.construct', function (constructor, args) {
            var ctor = null;
            var params = null;
            if (pro.isFunction(constructor) && pro.isDefined(args)) {
                ctor = constructor;
                params = args;
            }
            this.ctor = ctor;
            this.params = params;
        }).static(pro.object({
            create: function (constructor, args) {
                return new pro.construct(constructor, args);
            }
        })),
        serializable: pro.$class('pro.serializableAttribute << pro.attribute', function (params) {
            this.initializeBase('Serializable', pro.GUID.create());
            this.serializeAs = pro.serializable.serializeAs.json;
            if (pro.isObject(params)) {
                this.serializeAs = params['serializeAs'] || pro.serializable.serializeAs.json;
            }
        }, pro.attribute).static({
            serializeAs: pro.enumeration(pro.object({
                json: pro.enumMember.create('json', 0),
                xml: pro.enumMember.create('xml', 1),
                binary: pro.enumMember.create('binary', 2)
            }))
        }),
        /*@ Purpose: Implements the singleton pattern to create an instance of a defined object and returns the single instance.
		@ Param: typeName -> string: The name of the singleton instance type.
		@ Param: instance -> object: The instance of the object to return.
		@ Returns: Object -> The singleton instance of the object*/
        singleton: function (typeName, instance) {
            if (instance && pro.isObject(instance)) {
                var $class = pro.$class(typeName, function () {
                    this.instance = instance;
                });
                return new $class();
            }
            return pro.object();
        },
        /*@ Purpose: Aliases the namespace with the given name and adds it to the global scope for easier access to nested namespaces.
		@ Param: name -> string: The name or alias to give to the namespace for reference.
		@ Param: namespace -> object: The object chain that contains the namespace that you want to import.
		@ Returns: void.
		@ Overloads:
		1. $import
		@ Param: namespace -> object: A hash table with key value pairs representing the namespace and their aliases.
		@ Returns: void.*/
        $import: function (name, namespace) {
            if (arguments.length === 2) {
                if (pro.isObject(namespace)) {
                    global[name] = namespace;
                }
            } else if (arguments.length === 1) {
                pro.enumerateObject(arguments[0], function (key, value) {
                    global[key] = value;
                });
            }
        },
        $local: function (namespace) {
            var local = null;
            if (pro.isObject(namespace)) {
                local = namespace;
            }
            return local;
        },
        /*@ Purpose: Manages the disposoable resource by calling the Dispose method after the given action has been executed.
		@ Param: disposable -> object: The pro.disposable instance to manage. This object must implement pro.disposable.
		@ Param: action -> function: The method to be called using the given disposable resource.
		@ Arguments:
		1. disposable: object -> The disposable instance to use before it is closed.
		@ Returns: void*/
        manage: function (disposable, action) {
            if (disposable.isClass === true && disposable.is(pro.disposable)) {
                action.call(this, disposable);
                disposable.Dispose();
            }
        }
    });
    pro.extend({
        /*@ Purpose: Provides a uniform way of recursively calling a function with each recurisve call being done asynchronously.
        @ Param: action -> function: The action to be performed recursively.
        @ Notes: {
            action: function -> If recursion is to be cancled, the function should return false.
        }
        @ Returns: void*/
        recurseAsync: function (action) {
            if (pro.isFunction(action)) {
                var recurse;
                var $continue;
                if (requestAnimationFrame) {
                    recurse = function () {
                        requestAnimationFrame(function () {
                            $continue = action();
                            if ($continue !== false) {
                                recurse();
                            }
                        });
                    };
                } else {
                    recurse = function () {
                        setTimeout(function () {
                            $continue = action();
                            if ($continue !== false) {
                                recurse();
                            }
                        }, 0);
                    };
                }
                recurse();
            }
        }
    });
    pro.tryCatch.errorHandler = function (exception) {
        //Handle exception here...
    };
    pro.plainObject.prototype.asJson = function () {
        return pro.toJson(this);
    };
    global.pro = pro;
})(this, undefined);
