define('pro.angular', ['pro'], function (pro) {
    "use strict";
    pro.module('angular', pro.object({
        model: pro.$class('pro.angular.model', function (config) {
            if (pro.isObject(config)) {
                pro.extend(this, config);
            } else {
                this.modelState = pro.object({
                    isValid: function () {
                        return false;
                    }
                });
            }
        }),
        modelProperty: pro.$class('pro.angular.modelPropery', function (value, validator) {
            this.isValid = function () { };
            this.value = "";
            if (pro.isFunction(validator)) {
                this.isValid = validator;
            }
        }),
        modelState: pro.object({
            isValid: function (model) {
                var valid = true;
                if (pro.isObject(model)) {
                    pro.enumerateObject(model, function (prop, value) {
                        if (pro.isClass(value) && value.is(pro.angular.modelProperty)) {
                            if (!value.isValid()) {
                                valid = false;
                            }
                        }
                    });
                }
                return valid;
            }
        })
    }));
    return pro.angular;
});