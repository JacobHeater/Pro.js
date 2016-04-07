
/****************************************************************************
 *****************************************************************************
Pro.Class.js - A light-weight, slimmed down version of just the .$class() decorator from the Pro.js core libary. This decorator takes
all of the best aspects of the .$class() function from the core library and removes the rest of dependencies from the core library, leaving your
with a high-performance, no-nonsense way to easily create and extend prototypes in JavaScript. No more boilerplate, no more hassles, just prototypes
made easy.
 *****************************************************************************
 *****************************************************************************/
(function (global, undefined) {
    "use strict";
    var isString = function (obj) {
        return typeof obj === 'string';
    };
    var isFunction = function (fn) {
        return typeof fn === 'function';
    };
    var isDefined = function (obj) {
        return typeof obj !== 'undefined' && obj !== null;
    };
    var isObject = function (obj) {
        return isDefined(obj) && typeof obj === 'object';
    };
    var isClass = function (obj) {
        return isObject(obj) && obj.isClass === true;
    };
    var enumerateObject = function (obj, callback) {
        for (var key in obj) {
            callback(key, obj[key]);
        }
    };
    var $for = function (enumerable, callback) {
        for (var i = 0, len = enumerable.length; i < len; i++) {
            callback(i, enumerable[i]);
        }
    };
    var pro = {
        /*@ Purpose: A class that serves as the type of all of the decorated $class function instances.
		@ Param: typeName -> string: The name of the type.
		@ Param: nativeType -> string: The native JavaScript type of the object. Should be retrieved using the typeof keyword.
		@ Returns: Object -> The initialized instance of the pro.type class.*/
        type: function (typeName, nativeType) {
            this.name = typeName || "";
            this.nativeType = nativeType || null;
            return this;
        },
        /*@ Purpose: Encapsulates prototypical inheritance into a decorator function that adds many type checking features.
		@ Param: type -> string: The name of the class or type.
		@ Param: constructor -> function: Serves as the constructor when the new keyword is used.
		@ Param: base ->  function: Serves as the base of the constructor that will identify the constructor's prototype.
		@ Returns: Function -> The decorated constructor function.*/
        $class: function (type, constructor, base) {
            var $this = pro;
            if (isString(type) && isFunction(constructor)) {
                constructor.type = type;
                constructor.$class = true;
                if (isFunction(base)) {
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
                        enumerateObject($this.base, function (key, value) {
                            if (key !== "getType" && key !== "isClass" && key !== "is" && key !== "base" && key !== "initializeBase" && key !== 'getHashCode' && key !== 'overrides') {
                                if (isDefined($this.overrides)) {
                                    if (!isDefined($this.overrides[key])) {
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
                    if (isObject(members)) {
                        enumerateObject(members, function (key, value) {
                            constructor[key] = value;
                        });
                    }
                    return constructor;
                };
                constructor.prototype.getType = function () {
                    var _type = new pro.type(type, typeof this);
                    _type.isClass = true;
                    _type.constructor = constructor;
                    if (isDefined(this.base)) {
                        if (isClass(this.base)) {
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
                constructor.prototype.isClass = true;
                constructor.prototype.asJson = function () {
                    return JSON.stringify(this);
                };
                constructor.prototype.is = function (typeName) {
                    var name = this.getType().name,
					_typeName = isClass(typeName) ? typeName.prototype.getType().name : typeName,
					$this = this;
                    inheritance = name.split('<<'),
					isTypeMatch = false;
                    if (_typeName === name) {
                        isTypeMatch = true;
                    } else if (inheritance.length > 0 && this.base && this.base.isClass === true && isClass(_typeName)) {
                        $for(inheritance, function (i, value) {
                            if (_typeName.trim() === value.trim()) {
                                isTypeMatch = true;
                                return false;
                            }
                        });
                    }
                    if (isTypeMatch === false) {
                        var checkBase = function (obj) {
                            var isMatch = false;
                            if (isDefined(obj.base)) {
                                var base = obj.base,
								_proto = isFunction(_typeName) ? _typeName.prototype : isObject(_typeName) && isDefined(_typeName.constructor) && isDefined(_typeName.constructor.prototoype) ? _typeName.constructor.prototype : _typeName,
								baseProto = sObject(base) && areDefined(base.constructor, base.constructor.prototype) ? base.constructor.prototype : isFunction(base) ? base.prototype : base;
                                if (isDefined(base.isClass) && isDefined(base.getType)) {
                                    if (isString(_proto)) {
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
    };
    global.pro = pro;
})(this, undefined);
